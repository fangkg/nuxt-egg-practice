<template>
    <div>
        <h1>
            用户中心
        </h1>
        <div ref='drag' id='drag'>
            <input type="file" name="file" @change="handleFileChange">
        </div>
        <div>
            <el-progress :stroke-width='20' :text-inside="true" :percentage='uploadProgress'></el-progress>
        </div>
        <div>
            <el-button @click="uploadFile">上传</el-button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            file: null,
            uploadProgress: 0
        }
    },
    methods: {
        handleFileChange(e) {
            // 获取文件
            const  [file] = e.target.files
            if (!file) return
            this.file = file
        },
        // 上传图片
        async uploadFile() {
            // 图片转成二进制上传
            const form = new FormData()
            form.append('name', 'file')
            form.append('file', this.file)
            const ret = await this.$http.post('/uploadfile', form, {
                onUploadProgress: progress => {
                    this.uploadProgress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
                }
            })
            console.log('文件上传：', ret)
        },
        bindEvents() {
            const drag = this.$refs.drag
            // 拖进来
            drag.addEventListener('dragover', e => {
                drag.style.borderColor = 'red'
                e.preventDefault()
            })
            // 拖出去
            drag.addEventListener('dragleave', e => {
                drag.style.borderColor = 'blue'
                e.preventDefault()
            })
            // 放下鼠标
            drag.addEventListener('drop', e => {
                const fileList = e.dataTransfer.files
                drag.style.borderColor = 'blue'
                this.file = fileList[0]
                console.log(e.dataTransfer)

                e.preventDefault()
            })
        }
    },
    async mounted() {
       const ret = await this.$http.get('/user/info')
       console.log('ret:', ret)
       // 监听拖拽事件
       this.bindEvents()
    }
}
</script>

<style lang='stylus'>
#drag
    height 100px
    line-height 100px
    border 2px dashed blue
    text-align center
    vertical-align middle
    &:hover
        border-color red
</style>