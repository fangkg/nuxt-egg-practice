const svgCaptcha = require('svg-captcha');
const BaseController = require('./base')
const fse = require('fs-extra')

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
        // 获取文件 放在静态资源目录下
        const { ctx } = this
        const file = ctx.request.files[0]
        const { name } = ctx.request.body
        // 移动文件目录
        const ret = await fse.move(file.filepath, this.config.UPLOAD_DIR + '\\' + file.filename, { overwrite: true });
        this.success({
            url: `/public/${file.filename}`
        })
    }
}

module.exports = UtilController;
