const axios = require('axios');
const crypto = require('crypto');
const Commande = require('../models/Commande');

const KONNECT_API_KEY = process.env.KONNECT_API_KEY;
const KONNECT_WEBHOOK_SECRET_KEY = process.env.KONNECT_WEBHOOK_SECRET_KEY;
const KONNECT_API_BASE_URL = process.env.KONNECT_API_URL || 'https://api.sandbox.konnect.network/api/v2'; // Default to production

// Helper to ensure URLs are HTTPS for production, but allow HTTP for localhost
const ensureProtocol = (url, forceHttps = false) => {
    if (!url) return '';
    let newUrl = url.trim();
    if (newUrl.startsWith('http://localhost') || newUrl.startsWith('//localhost')) {
        return newUrl.startsWith('//') ? `http:${newUrl}` : newUrl;
    }
    if (forceHttps || !(newUrl.startsWith('http://') || newUrl.startsWith('http://'))) {
        if (newUrl.startsWith('//')) {
            return `https:${newUrl}`;
        }
        if (newUrl.includes('://')) {
            return newUrl.replace(/^http:/, 'http:');
        }
        return `http://${newUrl}`;
    }
    return newUrl;
};

// Function to initiate payment with Konnect
exports.initiateKonnectPayment = async (req, res) => {
    const { amount, orderId, firstName, lastName, email, phone, address } = req.body;

    if (!amount || !orderId || !firstName || !lastName || !email || !phone || !address) {
        return res.status(400).json({ message: 'Missing required payment details.' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;

    // Konnect expects full URLs
    const successUrl = ensureProtocol(`${clientUrl}/client/orders?order_id=${orderId}&payment_status=success`, process.env.NODE_ENV === 'sandbox');
    const failUrl = ensureProtocol(`${clientUrl}/client/cart?order_id=${orderId}&payment_status=failed`, process.env.NODE_ENV === 'sandbox');

    let webhookUrlBase = ensureProtocol(apiUrl, process.env.NODE_ENV === 'sandbox');
    if (webhookUrlBase.endsWith('/')) {
        webhookUrlBase = webhookUrlBase.slice(0, -1);
    }
    const webhookUrl = `${webhookUrlBase}/api/payment/konnect-webhook`;

    const payload = {
        receiverWallet: process.env.KONNECT_RECEIVER_WALLET_ID, // This needs to be configured in .env
        amount: parseFloat(amount) * 1000, // Konnect expects amount in millimes
        selectedPaymentMethod: "gateway",
        token: "TND", // Assuming Tunisian Dinar
        firstName,
        lastName,
        phoneNumber: phone,
        email,
        orderId: orderId.toString(),

        address,
        successUrl,
        failUrl,
        webhookUrl,
        acceptedPaymentMethods:
            ["wallet",
                "bank_card",
                "e-DINAR"], // Or other methods like "wallet", "flouci"
        checkoutType: "redirect_checkout", // For redirection flow
    };

    if (!payload.receiverWallet) {
        console.error('Konnect receiverWallet or merchantId is not configured in .env');
        return res.status(500).json({ message: 'Payment gateway configuration error.' });
    }

    try {
        const response = await axios.post(`${KONNECT_API_BASE_URL}/payments/init-payment`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': KONNECT_API_KEY
            }
        });

        if (response.data && response.data.payUrl && response.data.paymentRef) {
            const commande = await Commande.findById(orderId);
            if (commande) {
                commande.paymentInfo = commande.paymentInfo || {};
                commande.paymentInfo.konnectPaymentRef = response.data.paymentRef;
                commande.paymentInfo.method = 'Konnect';
                commande.paymentInfo.status = 'pending'; // Initial status
                await commande.save();
            }
            res.status(200).json({ payment_url: response.data.payUrl, payment_ref: response.data.paymentRef });
        } else {
            console.error('Konnect payment initiation failed:', response.data);
            res.status(500).json({ message: response.data.message || 'Failed to initiate payment with Konnect.' });
        }
    } catch (error) {
        console.error('Error initiating Konnect payment:', error.response ? error.response.data : error.message, error.stack);
        res.status(500).json({ message: 'Error initiating payment.' });
    }
};

// Function to handle Konnect webhook notifications
exports.handleKonnectWebhook = async (req, res) => {
    const signature = req.headers['konnect-signature'];
    const rawBody = req.rawBody; // Assuming rawBody middleware is used (e.g., bodyParser with verify function)

    if (!rawBody) {
        console.error('Konnect Webhook: Raw body not available. Ensure bodyParser is configured to preserve it.');
        return res.status(400).json({ message: 'Webhook error: Missing raw body.' });
    }

    if (!KONNECT_WEBHOOK_SECRET_KEY) {
        console.error('Konnect Webhook: Webhook secret key is not configured.');
        return res.status(500).json({ message: 'Webhook configuration error.' });
    }

    try {
        const calculatedSignature = crypto
            .createHmac('sha256', KONNECT_WEBHOOK_SECRET_KEY)
            .update(rawBody)
            .digest('hex');

        if (calculatedSignature !== signature) {
            console.error('Konnect Webhook: Invalid signature.');
            return res.status(400).json({ message: 'Invalid signature.' });
        }
    } catch (e) {
        console.error('Konnect Webhook: Error during signature verification:', e);
        return res.status(500).json({ message: 'Signature verification failed.' });
    }

    const { paymentRef, orderId, status, payment } = req.body;
    console.log('Received Konnect Webhook:', req.body);

    try {
        const commande = await Commande.findOne({ 'paymentInfo.konnectPaymentRef': paymentRef });
        // Fallback to orderId if paymentRef not found, though paymentRef should be primary
        // const commande = await Commande.findById(orderId);
        if (!commande) {
            console.error(`Konnect Webhook: Order with paymentRef ${paymentRef} (or orderId ${orderId}) not found.`);
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Konnect statuses: "pending", "processing", "succeeded", "failed", "canceled"
        if (status === 'success') {
            commande.statut = 'Payée';
            commande.paymentInfo = {
                ...commande.paymentInfo,
                status: 'paid',
                transactionId: payment?.transactionId || paymentRef, // Use Konnect's transactionId if available
                paidAt: new Date(),
                method: 'Konnect',
                rawResponse: req.body
            };
        } else if (status === 'failed' || status === 'canceled') {
            commande.statut = 'Paiement échoué';
            commande.paymentInfo = {
                ...commande.paymentInfo,
                status: status === 'failed' ? 'failed' : 'cancelled',
                transactionId: payment?.transactionId || paymentRef,
                method: 'Konnect',
                rawResponse: req.body
            };
        } else {
            // For 'pending', 'processing', or other statuses, we might just log or update a sub-status
            console.log(`Konnect Webhook: Order ${commande._id} status is ${status}. No final state change.`);
            // Optionally update paymentInfo with the current status if it's not final
            commande.paymentInfo.status = status;
        }

        await commande.save();
        console.log(`Konnect Webhook: Order ${commande._id} updated. Status: ${commande.statut}, Payment Status: ${commande.paymentInfo.status}`);
        res.status(200).json({ message: 'Webhook processed successfully.' });

    } catch (error) {
        console.error('Error processing Konnect webhook:', error);
        res.status(500).json({ message: 'Error processing webhook.' });
    }
};

// Function to verify Konnect transaction status
exports.verifyKonnectPayment = async (req, res) => {
    const { paymentRef } = req.params;

    if (!paymentRef) {
        return res.status(400).json({ message: 'Konnect Payment Reference is required.' });
    }

    const verificationUrl = `${KONNECT_API_BASE_URL}/payments/${paymentRef}`;

    try {
        const response = await axios.get(verificationUrl, {
            headers: {
                'x-api-key': KONNECT_API_KEY
            }
        });

        console.log('Konnect verifyPayment response:', response.data);
        // Potentially update order status based on this verification as well
        // This is useful for reconciliation or if a webhook was missed.
        const konnectPaymentData = response.data.payment;
        if (konnectPaymentData && konnectPaymentData.orderId) {
            const commande = await Commande.findById(konnectPaymentData.orderId);
            if (commande) {
                let updated = false;
                if (konnectPaymentData.status === 'success' && commande.paymentInfo.status !== 'paid') {
                    commande.statut = 'Payée';
                    commande.paymentInfo.status = 'paid';
                    commande.paymentInfo.transactionId = konnectPaymentData.transactionId || paymentRef;
                    commande.paymentInfo.paidAt = new Date(konnectPaymentData.updatedAt || Date.now());
                    commande.paymentInfo.method = 'Konnect';
                    updated = true;
                } else if ((konnectPaymentData.status === 'failed' || konnectPaymentData.status === 'canceled') &&
                    (commande.paymentInfo.status !== 'failed' && commande.paymentInfo.status !== 'cancelled')) {
                    commande.statut = 'Paiement échoué';
                    commande.paymentInfo.status = konnectPaymentData.status === 'failed' ? 'failed' : 'cancelled';
                    commande.paymentInfo.transactionId = konnectPaymentData.transactionId || paymentRef;
                    commande.paymentInfo.method = 'Konnect';
                    updated = true;
                }
                if (updated) {
                    await commande.save();
                    console.log(`Konnect verifyPayment: Order ${commande._id} updated based on verification.`);
                }
            }
        }
        res.status(200).json(response.data);

    } catch (error) {
        console.error('Error verifying Konnect payment:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error verifying payment.' });
    }
};