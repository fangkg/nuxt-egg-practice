const { Service } = require('egg')
const nodemailer = require('nodemailer')
const fse = require('fs-extra')
const { WriteStream } = require('fs-extra')
const path = require('path')

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
    // 发送邮箱验证码
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

    // 合并文件
    async mergeFile(filePath, fileHash, size) {
        // 切片文件夹
        const chunkDir = path.resolve(this.config.UPLOAD_DIR, fileHash)
        // 读取文件
        let chunks = await fse.readdir(chunkDir)
        // 排序
        chunks.sort((a, b) => a.split('-'[1] - b.split('-')[1]))
        // 构成完整的文件路径
        chunks = chunks.map(cp => path.resolve(chunkDir, cp))
        await this.mergeChunks(chunks, filePath, size)
    }

    // 合并chunk
    async mergeChunks(chunks, dest, size) {
        const pipStream = (filePath, WriteStream) => new Promise(resolve => {
            const readStream = fse.createReadStream(filePath)
            readStream.on('end', () => {
                fse.unlinkSync(filePath)
                resolve()
            })
            // 管道
            readStream.pipe(WriteStream)
        })

        await Promise.all(chunks.map((file, index) => {
            pipStream(file, fse.createWriteStream(dest, {
                start: index + size,
                end: (index + 1) + size
            }))
        }))
    }
}

module.exports = ToolService