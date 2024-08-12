const nodemailer = require('nodemailer');

async function sendEmail() {
    try {
        // Create a transporter using SMTP with your Gmail and App Password
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'physiphile@gmail.com', // Your Gmail address
                pass: 'kwxdxxcqeytkfufv' // Your generated App Password
            }
        });

        const message = {
            from: 'physiphile@gmail.com',
            to: '4058168685@mms.att.net', // Email-to-SMS gateway for AT&T
            subject: 'Test Email via Nodemailer and App Password',
            text: 'This is a test email sent using Gmail and App Password without OAuth2.'
        };

        // Send email
        const info = await transporter.sendMail(message);
        console.log('Text sent successfully!', info);
    } catch (error) {
        console.error('Error sending text:', error);
    }
}

sendEmail();
