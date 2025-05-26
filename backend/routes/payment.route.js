const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const {
  authMiddleware,
  clientMiddleware,
} = require("../middlewares/auth.middleware");

// POST /api/payment/konnect/initiate - Initiate a payment with Konnect
router.post('/konnect/initiate', authMiddleware, paymentController.initiateKonnectPayment);

// POST /api/payment/konnect-webhook - Handle Konnect webhook
// Konnect webhook requires raw body for signature verification
router.post('/konnect-webhook', express.raw({ type: 'application/json' }), paymentController.handleKonnectWebhook);

// GET /api/payment/konnect/verify/:paymentRef - Verify a Konnect payment
router.get('/konnect/verify/:paymentRef', authMiddleware, paymentController.verifyKonnectPayment);

module.exports = router;