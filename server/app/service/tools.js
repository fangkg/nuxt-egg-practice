const { Service } = require('egg')
const nodemailer = require('nodemailer')

const userEmail = '838692260@qq.com'
const transporter = nodemailer.createTransport({
    service: 'qq',
    secureConnection: true,
    auth: {
        user: userEmail,
        pass: '0326gefang0'
    }
})

class ToolService extends Service {
    async sendMail(email, subject, text, html) {
        const mailOptions = {
            from: userEmail,
            cc: userEmail,
            to: email,
            subject,
            text,
            html
        }

        try {
            await transporter.sendMail(mailOptions)
            return true
        } catch (err) {
            console.log('mial error:', err)
            return false
        }
    }
}

module.exports = ToolService