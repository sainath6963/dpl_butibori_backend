import Razorpay from "razorpay";
import crypto from "crypto";

class RazorpayService {
  constructor() {
    this.razorpay = null;
  }

  // 🔥 Lazy initialize Razorpay
  init() {
    if (this.razorpay) return;

    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys are not configured");
    }

    this.razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    console.log("✅ Razorpay initialized");
  }

  // ==============================
  // Create order
  // ==============================
  async createOrder(amount, currency = "INR", receipt) {
    this.init();

    const options = {
      amount: amount * 100,
      currency,
      receipt,
      payment_capture: 1,
    };

    try {
      return await this.razorpay.orders.create(options);
    } catch (error) {
      throw new Error(
        `Razorpay Order Creation Failed: ${error.message}`
      );
    }
  }

  // ==============================
  // Verify payment signature
  // ==============================
  verifyPaymentSignature(orderId, paymentId, signature) {
    const { RAZORPAY_KEY_SECRET } = process.env;

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay not configured");
    }

    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === signature;
  }

  // ==============================
  // Get payment details
  // ==============================
  async getPaymentDetails(paymentId) {
    this.init();
    return await this.razorpay.payments.fetch(paymentId);
  }

  // ==============================
  // Refund payment
  // ==============================
  async refundPayment(paymentId, amount = null) {
    this.init();

    const refundOptions = amount
      ? { amount: amount * 100 }
      : {};

    return await this.razorpay.payments.refund(
      paymentId,
      refundOptions
    );
  }
}

const razorpayService = new RazorpayService();
export default razorpayService;