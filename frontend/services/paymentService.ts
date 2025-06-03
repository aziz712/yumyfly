import api from "@/app/api/axios"; // Assuming your Axios instance is here

export interface KonnectPaymentPayload {
  orderId: string;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  // note?: string; // Optional
}

export interface KonnectPaymentResponse {
  payment_url: string;
  payment_ref: string;
  message?: string; // For error messages from backend
}

/**
 * Initiates a payment with Konnect via the backend.
 */
export const initiateKonnectPayment = async (
  payload: KonnectPaymentPayload
): Promise<KonnectPaymentResponse> => {
  try {
    const response = await api.post<KonnectPaymentResponse>(
      "/payment/konnect/initiate",
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Error initiating Konnect payment:", error.response?.data || error.message);
    // Rethrow or return a structured error to be handled by the caller
    throw error.response?.data || new Error('Failed to initiate Konnect payment');
  }
};

// If you need to add functions to verify Konnect payment from frontend (though typically handled by backend/webhook):
export const verifyKonnectPaymentStatus = async (paymentRef: string) => {
  try {
    const response = await api.get(`/payment/konnect/verify/${paymentRef}`);
    return response.data;
  } catch (error: any) {
    console.error('Error verifying Konnect payment status:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to verify Konnect payment status');
  }
};