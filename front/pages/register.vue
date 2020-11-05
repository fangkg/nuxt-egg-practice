<template>
    <div class="login-container">
        <el-form class="login-form" :model="form" :rules="rules" ref="registerFormRef">
            <div class="title-container">
                <img src="/logo.png" alt="">
            </div>
            <el-form-item>
                <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                email: ''
            },
            rules: {
                email: [
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入正确的邮箱格式' }
                ]
            }
        }
    }
}
</script>

<style lang="stylus">

</style>