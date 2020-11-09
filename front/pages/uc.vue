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
        <div>
            <span>计算hash的进度</span>
            <el-progress :stroke-width='20' :text-inside="true" :percentage='hashProgress'></el-progress>
        </div>
    </div>
</template>

<script>
import sparkMD5 from 'spark-md5'
// 文件切片大小为1M
const CHUNK_SIZE = 1 * 1024 * 1024
export default {
    data() {
        return {
            file: null,
            uploadProgress: 0,
            hashProgress: 0
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
            // 判断是否为图片
            if (! await this.isImage(this.file)) {
                alert('文件格式不对！')
                return
            }
            // 图片切片
            const chunks = this.createFileChunk(this.file)
            // 计算hash
            const hash = await this.calculateHashWorker()
            // 计算hashIdle
            const hashIdle = await this.calculateHashIdle()
            console.log('hash:', hash, hashIdle)
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
        },

        // 判断是否为图片
        async isImage(file) {
            // 先判定是否为gif 前面6各16进制 GIF89a GIF87a
            return await this.isGif(file) || await this.isPng(file)
        },

        // gif
        async isGif(file) {
            const ret = await this.blobToString(file.slice(0, 6))
            const isGif = (ret === '47 49 46 38 39 61') || (ret === '47 49 46 38 37 61')
            return isGif
        },

        // png
        async isPng(file) {
            const ret = await this.blobToString(file.slice(0, 8))
            const ispng = (ret === '89 50 4E 47 0D 0A 1A 0A')
            return ispng
        },

        // jpg
        async isJpg(file) {
            const len = file.size
            const start = await this.blobToString(file.slice(0, 2))
            const tail = await this.blobToString(file.slice(-2, len))
            const isJpg = (start === 'FF D8') && (tail === 'FF D9')
            return isJpg
        },

        // 读文件
        blobToString(blob) {
            return new Promise(resolve => {
                const reader = new FileReader()
                reader.onload = function() {
                    console.log(reader.result)
                    const ret = reader.result.split('')
                                    .map(v => v.charCodeAt())
                                    .map(v => v.toString(16).toUpperCase())
                                    .map(v => v.padStart(2, '0'))
                                    .join('')
                    resolve(ret)
                }
                reader.readAsBinaryString(blob)
            })
        },

        // 文件切片上传
        createFileChunk(file, size = CHUNK_SIZE) {
            const chunks = []
            let cur = 0
            while(cur < this.file.size) {
                chunks.push({ index: cur, file: this.file.slice(cur, cur + size)})
                cur += size
            }
            return chunks
        },

        // 计算md5
        async calculateHashWorker() {
            return new Promise(resolve => {
                this.worker = new Worker('/hash.js')
                this.worker.postMessage({ chunks: this.chunks })
                this.worker.onmessage = e => {
                    const { progress, hash } = e.data
                    this.hashProgress = Number(progress.toFixed(2))
                    if (hash) {
                        resolve(hash)
                    }
                }
            })
        },

        // fiber 时间切片
        calculateHashIdle() {
            const chunks = this.chunks
            return new Promise(resolve => {
                const spark = new sparkMD5.ArrayBuffer()
                let count = 0

                const appendToSpark = async file => {
                    return new Promise(resolve => {
                        const reader = new FileReader()
                        reader.readAsArrayBuffer(file)
                        reader.onload = e => {
                            spark.append(e.target.result)
                            resolve(appendToSpark)
                        }
                    })
                }

                const workLoop = async deadline => {
                    while(count < chunks.length && deadline.timeRemaining() > 1) {
                        // 空闲时间且有任务
                        await appendToSpark(chunks[count].file)
                        count ++
                        if (count < chunks.length) {
                            this.hashProgress = Number(((100 * count)/chunks.length).toFixed(2))
                        } else {
                            this.hashProgress = 100
                            resolve(spark.end())
                        }
                    }
                    // 继续轮询
                    window.requestIdleCallback(workLoop)
                }
                window.requestIdleCallback(workLoop)
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