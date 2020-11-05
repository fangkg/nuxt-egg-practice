<template>
    <div class="login-container">
        <el-form class="login-form" label-width="100px" :model="form" :rules="rules" ref="registerFormRef">
            <div class="title-container">
                <img src="/logo.png" alt="">
            </div>
            <el-form-item prop="email" label="邮箱">
                <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
            </el-form-item>
            <el-form-item prop="captcha" label="验证码" class="captcha-container">
                <div class="captcha">
                    <img :src="code.captcha" alt="" @click="resetCaptcha">
                </div>
                <el-input v-model="form.captcha" placeholder="请输入验证码"></el-input>
            </el-form-item>
            <el-form-item prop="nickname" label="昵称">
                <el-input v-model="form.nickname" placeholder="请输入邮箱"></el-input>
            </el-form-item>
            <el-form-item prop="password" label="密码">
                <el-input type="password" v-model="form.password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item prop="rePassword" label="确认密码">
                <el-input type="password" v-model="form.rePassword" placeholder="请再次输入密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click.native.prevent="handleRegister">注册</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import md5 from 'md5';

export default {
    layout: 'login',
    data() {
        return {
            form: {
                email: '18752068853@163.com',
                captcha: '',
                nickname: 'jack',
                password: 'asddfsf',
                rePassword: 'asddfsf'
            },
            rules: {
                email: [
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入正确的邮箱格式' }
                ],
                captcha: [
                    { required: true, message: '请输入验证码'}
                ],
                nickname: [
                    { required: true, message: '请输入昵称' }
                ],
                password: [
                    { required: true, pattern:/^[\w_-]{6,12}$/g, message: '请输入6~12位密码' },
                    { validator:(rule, value, callback) => {
                        if (value !== this.form.rePassword) {
                            callback(new Error('两次密码不一致！'))
                        }
                        callback()
                    }}
                ]
            },
            code: {
                captcha: "/api/captcha"
            }
        }
    },
    methods: {
        // 注册
        handleRegister() {
            this.$refs.registerFormRef.validate(async valid => {
                if (valid) {
                    console.log('校验成功！')
                    let param = {
                        email: this.form.email,
                        captcha: this.form.captcha,
                        nickname: this.form.nickname,
                        password: md5(this.form.password)
                    }
                    let ret = await this.$http.post('/user/register', param);
                    if (ret.code == 0) {
                        this.$alert('注册成功', '成功', {
                            confirmButtonText: '去登录',
                            callback: () => {
                                this.$router.push('/login')
                            }
                        })
                    } else {
                        this.$message.error(ret.message)
                    }
                } else {
                    console.log('校验失败！')
                }
            })
        },
        // 重置验证码
        resetCaptcha() {
            this.code.captcha = '/api/captcha?_t' + new Date().getTime();
        }
    }
}
</script>

<style lang="stylus">

</style>