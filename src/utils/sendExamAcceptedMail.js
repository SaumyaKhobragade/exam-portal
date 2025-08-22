import nodemailer from 'nodemailer';

/**
 * Send an email to the requester when their exam request is accepted.
 * Uses credentials from environment variables: MAIL_USER and MAIL_PASS
 * @param {string} toEmail - The recipient's email address
 * @param {string} requesterName - The name of the requester
 */
export async function sendExamAcceptedMail(toEmail, requesterName) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.SUPPORT_MAIL,
            pass: process.env.SUPPORT_MAIL_PASSWORD,
        }
    });

    const mailOptions = {
        from: `CodeSecure <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: 'Your Exam Hosting Request Has Been Accepted',
        html: `<p>Dear ${requesterName},</p>
               <p>Congratulations! Your request to host an exam on CodeSecure has been <b>accepted</b>.</p>
               <p>We will contact you soon with further details.</p>
               <br><p>Best regards,<br>CodeSecure Team</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending acceptance email:', error);
        return false;
    }
}
