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
        <div>
            <!-- chunk.progress progress < 0报错 显示红色 === 100 成功 显示绿色 -->
            <!-- 尽可能让方块看起来是正方形 3*3 4*4 -->
            <div class="cube-container" :style="{ width: cubeWidth + 'px' }">
                <div class="cube" v-for="chunk in chunks" :key="chunk.name">
                    <!-- 状态判定 -->
                    <div
                        :class = "{
                            'uploading': chunk.progress > 0 && chunk.progress < 100,
                            'success': chunk.progress === 100,
                            'error': chunk.progress < 0
                        }"
                        :style = "{
                            height: chunk.progress + '%'
                        }">
                    <!-- 显示进度 -->
                    <i class="el-icon-loading" style="color: #f56c6c" v-if="chunk.progress < 100 && chunk.progress > 0"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import sparkMD5 from 'spark-md5'
import { off } from 'process'
// 文件切片大小为1M
const CHUNK_SIZE = 1 * 1024 * 1024
export default {
    data() {
        return {
            file: null,
            // uploadProgress: 0,
            hashProgress: 0,
            chunks: []
        }
    },
    computed: {
        cubeWidth() {
            // 平方根向上取整
            return Math.ceil(Math.sqrt(this.chunks.length)) * 16
        },
        uploadProgress() {
            if (!this.file || this.chunks.length) {
                return 0
            }
            // 已经上传的进度累加
            const loaded = this.chunks.map(item => item.chunk.size * item.progress)
                                        .reduce((acc, crr) => acc + cur, 0) // reduce初始值为0
            return parseFloat(((loaded * 100) / this.file.size).toFixed(2))
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
            if (!this.file) {
                return
            }
            // 判断是否为图片
            if (! await this.isImage(this.file)) {
                alert('文件格式不对！')
                return
            }
            // 图片切片
            const chunks = this.createFileChunk(this.file)
            // 计算hashWorker
            // const hashWorker = await this.calculateHashWorker()
            // 计算hashIdle
            // const hashIdle = await this.calculateHashIdle()
            // 抽样hash
            const hashSample = await this.calculateHashSample()
            console.log('hash:', hashSample)
            this.hash = hashSample

            // 向后端询问文件是否上传过，如果没有是否存在切片
            const { data: { uploaded, uploadedList } }= await this.$http.post('/checkfile', {
                hash: this.hash,
                ext: this.file.name.split('.').pop()
            })

            // 已经上传过 秒传
            if (uploaded) {
                return this.$message.success('秒传成功！')
            }
            // 变成结构化数据
            this.chunks = chunks.map((chunk, index) => {
                // 切片名字 hash + index
                const name = hash + '-' + index
                return {
                    hash,
                    name,
                    index,
                    chunk: chunk.file,
                    // 设置进度条 已经上传的 设置为100
                    progress: uploadedList.indexOf(name) > -1 ? 100 : 0
                }
            })
            await this.uploadChunks()
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
        },

        // 抽样hash 布隆过滤器 损失精度换效率 hash一样文件不一定一样 hash不一样文件一定不一样
        async calculateHashSample() {
            return new Promise(resolve => {
                const spark = new sparkMD5.ArrayBuffer()
                const reader = new FileReader()

                const file = this.file
                const size = file.size
                const offset = 2 * 1024 * 1024
                // 第一个2M 最后一个区块数据全要 中间的 取前中后各2个字节
                let chunks = [file.slice(0, offset)]
                let cur = offset
                while(cur < size) {
                    if (cur + offset >= size) {
                        // 最后一个
                        chunks.push(file.slice(cur, cur + offset))
                    } else {
                        // 中间区块
                        const mid = cur + offset / 2
                        const end = cur + offset
                        chunks.push(file.slice(cur, cur + 2))
                        chunks.push(file.slice(mid, mid + 2))
                        chunks.push(end -2, end)
                    }
                    // 抽样完成累加
                    cur += offset
                }
                // 中间的 取前中后各2个字节
                reader.readAsArrayBuffer(new Blob(chunks))
                reader.onload = e => {
                    spark.append(e.target.result)
                    this.hashProgress = 100
                    resolve(spark.end())
                }
            })
        },

        // 上传chunks
        async uploadChunks(uploadedList = []) {
            const requests = this.chunks
                .filter(chunk => uploadedList.indexOf(chunk.name) === -1)
                .map((chunk, index) => {
                // 转成form
                const form = new FormData()
                form.append('chunk', chunk.chunk)
                form.append('hash', chunk.hash)
                form.append('name', chunk.name)
                // form.append('index', chunk.index)
                return { form, index: chunk.index, error: 0 }
            }).map(({form, index}) => {
                this.$http.post('/uploadfile', form, {
                    onUploadProgress: progress => {
                        // 不是整体进度条 而是每个区块有自己的进度条，整体进度条需要计算
                        this.chunks[index].progress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
                    }
                })
            })
            // 发送全部请求 异步并发量控制 
            // 尝试建立tcp连接过多也会导致卡顿
            // await Promise.all(requests)
            await this.sendRequest(requests)
            // 合并文件
            await this.mergeRequest()
        },

        async mergeRequest() {
            this.$http.post('mergeFile', {
                ext: this.file.name.split('.').pop(),
                size: CHUNK_SIZE,
                hash: this.hash
            })
        },

        // 限制并发请求数量
        // 上传可能报错 报错之后进度条变红开始重试 一个切片重试失效三次 整体全部终止
        async sendRequest(chunks, limit = 4) {
            // limit并发数
            const len = chunks.length
            let count = 0
            // 全局开关
            let isStop = false
            const start = async () => {
                // 错误次数达到最大次数不再重新连接
                if (isStop) {
                    return
                }
                // 弹出一个任务
                const task = chunks.shift()
                if(task) {
                    const { form, index } = task
                    try {
                        await this.$http.post('/uploadfile', form, {
                            onUploadProgress: progress => {
                                this.chunks[index].progress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
                            }
                        })
                        if (count === len -1) {
                            // 最后一个任务
                            resolve()
                        } else {
                            count ++
                            // 启动下一个任务
                            start()
                        }
                    } catch(e) {
                        this.chunks[index].progress = -1
                        // 报错次数小于3重试
                        if (task.error < 3) {
                            task.error ++
                            chunks.unshift(task)
                            start()
                        } else {
                            // 报错次数大于3
                            isStop = true
                            reject()
                        }  
                    }
                }
            }
            // 启动limit个任务
            while(limit > 0) {
                // 模拟延时
                setTimeout(() => {
                    start()
                }, Math.random() * 2000)
                // start()
                limit -= 1
            }
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
.cube-container
    .cube
        width 14px
        height 14px
        line-height 12px
        border 1px black solid
        background #eee
        float left
        >.success
            background green
        >.uploading
            background blue
        >.error
            background red
</style>