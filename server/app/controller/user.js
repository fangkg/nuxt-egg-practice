const BaseController = require('./base');


const createRule = {
    email: { type: 'email' },
    nickname: { type: 'string' },
    password: { type: 'string' },
    captcha: { type: 'string' }
}
class UserController extends BaseController {

    async login() {

    }

    async register() {
        const { ctx } = this
        try {
            // 校验传递的参数
            ctx.validate(createRule);
        } catch(e) {
            return this.error('参数失败', -1, e.errors)
        }

        const { email, password, captcha, nickname } = ctx.request.body
        console.log({ email, password, captcha, nickname })

        // 校验验证码
        if (captcha.toUpperCase() === ctx.session.captcha.toUpperCase()) {

        } else {
            this.error('验证码错误！')
        }
        // this.success({ name: 'jack' })
    }

    async verify() {
        // 校验用户名是否村子
    }

    async info() {

    }
}

module.exports = UserController