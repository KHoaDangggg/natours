import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import * as url from 'url';
import nodemailerSendgrid from 'nodemailer-sendgrid';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = 'DangPhucKhoa';
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport(
                nodemailerSendgrid({
                    apiKey: process.env.SENDGRID_PASSWORD,
                })
            );
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async send(template, subject) {
        //1. Render
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject,
            }
        );
        //2. Define email options
        const emailOption = {
            from: 'dangphuckhoa2003@gmail.com',
            to: this.to,
            subject,
            html,
            text: convert(html),
        };
        //3. Send email
        await this.newTransport().sendMail(emailOption);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to Natours');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token (Only valid for 10 minutes)'
        );
    }
}

export default Email;
