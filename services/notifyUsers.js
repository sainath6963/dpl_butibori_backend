import nodemailer from 'nodemailer';

class NotificationService {
    constructor() {
        // Create email transporter
        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Send email notification
    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: `"DPL Butibori" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: ', info.messageId);
            return info;
        } catch (error) {
            console.error('Email sending failed:', error);
            // Don't throw error to prevent breaking main flow
        }
    }

    // Registration success notification
    async sendRegistrationSuccess(user, player, payment) {
        const subject = 'Registration Successful - DPL Butibori';
        const html = `
            <h1>Welcome to DPL Butibori!</h1>
            <p>Dear ${user.name},</p>
            <p>Your registration for the cricket match has been successfully completed.</p>
            
            <h2>Registration Details:</h2>
            <ul>
                <li><strong>Player Name:</strong> ${player.fullName}</li>
                <li><strong>Player Role:</strong> ${player.playerRole}</li>
                <li><strong>Payment Amount:</strong> ₹${payment.amount}</li>
                <li><strong>Payment ID:</strong> ${payment.razorpayPaymentId}</li>
                <li><strong>Status:</strong> Confirmed</li>
            </ul>
            
            <p>You will receive further details about match schedule soon.</p>
            
            <p>Best regards,<br>DPL Butibori Team</p>
        `;

        await this.sendEmail(user.email, subject, html);
    }

    // Payment success notification
    async sendPaymentSuccess(user, payment) {
        const subject = 'Payment Successful - DPL Butibori';
        const html = `
            <h1>Payment Successful!</h1>
            <p>Dear ${user.name},</p>
            <p>Your payment of ₹${payment.amount} has been successfully processed.</p>
            
            <h2>Payment Details:</h2>
            <ul>
                <li><strong>Payment ID:</strong> ${payment.razorpayPaymentId}</li>
                <li><strong>Order ID:</strong> ${payment.razorpayOrderId}</li>
                <li><strong>Amount:</strong> ₹${payment.amount}</li>
                <li><strong>Date:</strong> ${new Date(payment.paidAt).toLocaleString()}</li>
                <li><strong>Status:</strong> ${payment.status}</li>
            </ul>
            
            <p>Your invoice will be generated and sent shortly.</p>
            
            <p>Best regards,<br>DPL Butibori Team</p>
        `;

        await this.sendEmail(user.email, subject, html);
    }

    // Send SMS notification (simplified - integrate with SMS service in production)
    async sendSMS(phone, message) {
        console.log(`SMS to ${phone}: ${message}`);
        // Integrate with SMS gateway like Twilio in production
    }
}

const notificationService = new NotificationService();
export default notificationService;