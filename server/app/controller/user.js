const BaseController = require('./base');
const md5 = require('md5')
const jwt = require('jsonwebtoken')

const HashSalt = 'jack@163.com'
const createRule = {
    email: { type: 'email' },
    nickname: { type: 'string' },
    password: { type: 'string' },
    captcha: { type: 'string' }
}
class UserController extends BaseController {

    async login() {
        // this.success('token')
        const { ctx, app } = this
        const { email, captcha, password, emailcode } = ctx.request.body
        if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
            return this.error('验证码错误！')
        }

        if (emailcode !== ctx.session.email.code) {
            return this.error('邮箱验证码错误！')
        }

        const user = await ctx.model.User.findOne({
            email,
            password: md5(password + HashSalt)
        })

        if (!user) {
            return this.error('用户名密码错误！')
        }

        // 用户存在将用户信息加密成token返回
        const token = jwt.sign({
            _id: user._id,
            email,
        }, app.config.jwt.secret, {
            expiresIn: '5m'
        })

        this.success({ token, email, nickname: user.nickname })
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
        if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
            return this.error('验证码错误！')
        }

        // 校验邮箱
        if (await this.checkEmail(email)) {
            this.error('邮箱重复了！')
        } else {
            const ret = await ctx.model.User.create({
                email,
                nickname,
                password: md5(password + HashSalt) // 密码加盐
            })
            
            if (ret._id) {
                this.message('注册成功！')
            }
        }
        // this.success({ name: 'jack' })
    }

    async checkEmail(email) {
        const user = await this.ctx.model.User.findOne({ email })
        return user
    }

    async verify() {
        // 校验用户名是否存在
    }

    async info() {
        const { ctx } = this
        // 获取header解析
        // 还不知道是哪个邮箱 需要从token中获取
        // 有的接口需要从token里获取 有的不需要
        const { email } = ctx.state
        const user = await this.checkEmail(email)

        this.success(user)
    }
}

module.exports = UserController