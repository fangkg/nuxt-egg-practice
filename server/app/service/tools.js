const { Service } = require('egg')
const nodemailer = require('nodemailer')

const userEmail = 'fangkg1107@126.com'
const transporter = nodemailer.createTransport({
    service: '126',
    secureConnection: true,
    auth: {
        user: userEmail,
        pass: 'YUEHAXFZMIRVGLMB'
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