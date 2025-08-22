import nodemailer from 'nodemailer';

/**
 * Send an email to the requester when their exam request is rejected.
 * Uses SendGrid SMTP credentials from .env for real email delivery.
 * @param {string} toEmail - The recipient's email address
 * @param {string} requesterName - The name of the requester
 */
export async function sendExamRejectedMail(toEmail, requesterName) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: `CodeSecure <${process.env.FROM_EMAIL}>`,
        to: toEmail,
        subject: 'Your Exam Hosting Request Has Been Rejected',
        html: `<p>Dear ${requesterName},</p>
               <p>We regret to inform you that your request to host an exam on CodeSecure has been <b>rejected</b>.</p>
               <p>If you have any questions or would like more information, please contact our support team.</p>
               <br><p>Best regards,<br>CodeSecure Team</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending rejection email:', error);
        return false;
    }
}
