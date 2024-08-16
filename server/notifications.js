const nodemailer = require('nodemailer');
const utils = require('./utils.js');
const AccountsManager = require('./accounts/accounts-manager.js');

const CELL_PROVIDERS = {
    'AT&T': '@mms.att.net',
    'T-Mobile': '@tmomail.net',
    'Verizon': '@vzwpix.com',
    'Sprint': '@pm.sprint.com',
    'Virgin Mobile': '@vmpix.comm',
    'Tracfone': '@mmst5.tracfone.com',
    'MetroPCS': '@mymetropcs.com',
    'Boost': '@myboostmobile.com',
    'Cricket': '@mms.cricketwireless.net',
    'US Cellular': '@mms.uscc.net'
};

const CELL_PROVIDER_ALIASES = {
    'ATT': CELL_PROVIDERS['AT&T'],
    'TMobile': CELL_PROVIDERS['T-Mobile'],
    'VirginMobile': CELL_PROVIDERS['Virgin Mobile'],
    'US_Cellular': CELL_PROVIDERS['US Cellular']
};

const ALL_CELL_PROVIDERS = {
    ...CELL_PROVIDERS,
    ...CELL_PROVIDER_ALIASES
};

const TAG = '[Notifications]';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 60 * 1000; // 10 seconds

class Notifications {
    constructor() {
        this.transporter = null;
        this.isInitialized = false;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async retryWithExponentialBackoff(fn, retries = 0) {
        try {
            return await fn();
        } catch (error) {
            if (retries >= MAX_RETRIES) {
                console.error(TAG, `Max retries (${MAX_RETRIES}) reached. Giving up.`);
                throw error;
            }

            const delayTime = INITIAL_RETRY_DELAY * Math.pow(2, retries);
            console.log(TAG, `Retry attempt ${retries + 1}. Waiting for ${delayTime}ms before next attempt.`);
            await this.delay(delayTime);

            return this.retryWithExponentialBackoff(fn, retries + 1);
        }
    }

    init = async () => {
        if (this.isInitialized) {
            return;
        }

        console.log(TAG, 'Starting initialization...');

        try {
            await this.retryWithExponentialBackoff(async () => {
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASS // Use the app password here
                    }
                });

                await this.transporter.verify();
                console.log(TAG, 'Mail server is ready to send messages.');
                this.isInitialized = true;
            });
        } catch (error) {
            console.error(TAG, 'Error during transporter initialization:', error);
            this.transporter = null;
            this.isInitialized = false;
            throw error;
        }
    }

    sendNotification = async (type, recipient, subject, body, attachments) => {
        if (!this.isInitialized) {
            await this.init();
        }

        if (!this.transporter) {
            throw new Error('Transporter is not initialized. SMTP configuration may be missing or incorrect.');
        }

        try {
            await this.retryWithExponentialBackoff(async () => {
                switch (type) {
                    case 'email':
                        await this.sendEmail(recipient, subject, body, attachments);
                        break;
                    case 'sms':
                        await this.sendText(recipient, subject, body, attachments);
                        break;
                    default:
                        throw new Error('Notification type must be either "email" or "sms".');
                }
            });
        } catch (error) {
            console.error(TAG, 'Error sending notification:', error);
            throw error;
        }
    }

    sendEmail = async (recipient, subject, body, attachments) => {
        let email, html, text;

        if (typeof recipient === 'string') {
            email = recipient;
        } else {
            const account = AccountsManager.getAccountById(recipient.account_id);
            email = recipient.email || (account && account.email);
        }

        if (!email) {
            throw new Error('Email address or account ID is required to send an email notification.');
        }

        if (typeof body === 'string') {
            html = text = body;
        } else {
            html = '<html><body>' + body.html + '</body></html>';
            text = body.text && utils.stripHtml(body.text);
        }

        const message = {
            from: process.env.GMAIL_USER,
            to: email,
            subject,
            text,
            html,
            attachments
        };

        try {
            let info = await this.transporter.sendMail(message);
            console.log(TAG, `Email sent to ${email}. Message ID: %s`, info.messageId);
        } catch (error) {
            console.error(TAG, `Error sending email to ${email}:`, error);
            throw error;
        }
    }

    sendText = async (recipient, subject, text, attachments) => {
        const account = AccountsManager.getAccountById(recipient.account_id);
        let phone = recipient.phone_number || (account && account.phone_number),
            provider = ALL_CELL_PROVIDERS[(recipient.phone_provider || (account && account.phone_provider))];

        if (!phone) {
            throw new Error('Phone number or account ID is required to send an SMS notification.');
        }

        if (!provider) {
            throw new Error('Supplied phone provider is not supported.');
        }

        try {
            await this.sendEmail(phone + provider, subject, text, attachments);
            console.log(TAG, `Text sent to ${phone} via ${provider}`);
        } catch (error) {
            console.error(TAG, `Error sending text to ${phone}:`, error);
            throw error;
        }
    }
}

const notifications = new Notifications();

module.exports = notifications;
