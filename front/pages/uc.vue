<template>
    <div>
        <h1>
            用户中心
        </h1>
        <div>
            <input type="file" name="file" @change="handleFilterChange">
        </div>
        <div>
            <el-button @click="uploadFile">上传</el-button>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        handleFilterChange(e) {
            // 获取文件
            const  [file] = e.target.files
            if (!file) return
            this.file = file
        },
        async uploadFile() {
            // 图片转成二进制上传
            const form = new FormData()
            form.append('name', 'file')
            form.append('file', this.file)
            const ret = await this.$http.post('/uploadfile', form)
            console.log('文件上传：', ret)
        }
    },
    async mounted() {
       const ret = await this.$http.get('/user/info')
       console.log('ret:', ret)
    }
}
</script>