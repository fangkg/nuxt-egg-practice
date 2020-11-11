const svgCaptcha = require('svg-captcha');
const BaseController = require('./base')
const fse = require('fs-extra')
const path = require('path')

class UtilController extends BaseController {
    //   async index() {
    //     const { ctx } = this;
    //     ctx.body = 'hi, egg';
    //   }
    // 获取svg验证码
    async captcha() {
        const captcha = svgCaptcha.create({
            size: 4,
            fontSize: 50,
            width: 100,
            height: 40,
            nosize: 3
        });
        console.log('captcha=>', captcha.text);
        this.ctx.session.captcha = captcha.text;
        this.ctx.response.type = "image/svg+xml";
        this.ctx.body = captcha.data;
    }

    // 获取邮箱验证码
    async sendcode() {
        const { ctx } = this
        const email = ctx.query.email
        let code = Math.random().toString().slice(2, 6)
        console.log('邮箱：', email, code)
        ctx.session.emailcode = code
        
        const subject = '登录邮箱验证码！'
        const text = ''
        const html = `<h2>测试邮箱验证码</h2><a href="https://baidu.com"><span>${ code }</span></a>`

        const hasSend = await this.service.tools.sendMail(email, subject, text, html)
        if (hasSend) {
            this.message('发送成功！')
        } else {
            this.error('发送失败')
        }
    }

    // 上传文件
    async uploadfile() {
        // 上传文件报错
        if (Math.random() > 0.5) {
            return this.ctx.status = 500
        }
        // public/hash/name{hash+index}
        // 获取文件 放在静态资源目录下
        const { ctx } = this
        // 获取文件
        const file = ctx.request.files[0]
        // 获取body
        const { hash, name } = ctx.request.body
        const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash)
        // 判断路径是否存在
        if (!fse.existsSync(chunkPath)) {
            // 不存在新建
            await fse.mkdir(chunkPath)
        }

        // 移动文件目录
        // const ret = await fse.move(file.filepath, this.config.UPLOAD_DIR + '\\' + file.filename, { overwrite: true });
        await fse.move(file.filepath, `${ chunkPath } \\ ${ name }`)
        // this.success({
        //     url: `/public/${file.filename}`
        // })
        this.message('切片上传成功！')
    }

    // 合并文件
    async mergeFile() {
        const { ext, name, hash } = this.ctx.request.body
        const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
        await this.ctx.service.tools.mergeFile(filePath, hash, size)
        this.success({
            url: `/public/${hash}.${ext}`
        })
    }

    // 检查文件是否上传过
    async checkfile() {
        const { ctx } = this
        const { ext, hash } = ctx.request.body
        const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)

        let uploaded = false
        let uploadedList = []
        if (fse.existsSync(filePath)) {
            // 文件存在
            uploaded = true
        } else {
            uploadedList = await this.getUploadedList(path.resolve(this.config.UPLOAD_DIR, hash))
        }

        this.success({
            uploaded,
            uploadedList
        })
    }

    // 获取已上传文件列表
    async getUploadedList(dirPath) {
        return fse.existsSync(dirPath) ? (await (await fse.readdir(dirPath)).filter(name => name[0] !== '.')) : []
    }
}

module.exports = UtilController;
