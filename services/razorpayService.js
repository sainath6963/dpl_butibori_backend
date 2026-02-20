import Razorpay from "razorpay";
import crypto from "crypto";

class RazorpayService {
  constructor() {
    if (
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET
    ) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      console.log("✅ Razorpay initialized");
    } else {
      this.razorpay = null;
      console.log("⚠️ Razorpay keys missing — running without payments");
    }
  }

  // Create order
  async createOrder(amount, currency = "INR", receipt) {
    if (!this.razorpay) {
      throw new Error("Razorpay not configured");
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt,
      payment_capture: 1,
    };

    try {
      return await this.razorpay.orders.create(options);
    } catch (error) {
      throw new Error(`Razorpay Order Creation Failed: ${error.message}`);
    }
  }

  // Verify payment signature
  verifyPaymentSignature(orderId, paymentId, signature) {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay not configured");
    }

    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === signature;
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    if (!this.razorpay) {
      throw new Error("Razorpay not configured");
    }

    return await this.razorpay.payments.fetch(paymentId);
  }

  // Refund payment
  async refundPayment(paymentId, amount = null) {
    if (!this.razorpay) {
      throw new Error("Razorpay not configured");
    }

    const refundOptions = amount ? { amount: amount * 100 } : {};

    return await this.razorpay.payments.refund(paymentId, refundOptions);
  }
}

const razorpayService = new RazorpayService();
export default razorpayService;
