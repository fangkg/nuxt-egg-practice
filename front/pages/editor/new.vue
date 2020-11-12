<template>
    <div>
        <div contenteditable="true">哈哈</div>
        <div class="write-btn">
            <el-button @click="submit" type="primary">提交</el-button>
        </div>
        <el-row>
            <el-col :span="12">
                <!-- markdown编辑器的基本操作 -->
                <textarea ref="editorRef" class="md-editor" :value="content" @input="update"></textarea>
            </el-col>
            <el-col :span="12">
                <!-- 显示文本 -->
                <div class="markdown-body" v-html="compiledContent"></div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import marked from 'marked'
// 代码高亮
import hljs from 'highlight.js'
// 引入js模板
import javascript from 'highlight.js/lib/languages/javascript'
// 引入样式
import 'highlight.js/styles/monokai-sublime.css'

export default {
    data() {
        return {
            content: `# markdown编辑器
            * 写代码
            * 上课
            * 吃饭
            \`\`\`javascript

  let a =1;
  console.log(a)
\`\`\`
      `
        }
    },
    computed: {
        compiledContent() {
            return marked(this.content, {})
        }
    },
    methods: {
        update(e) {
            // 清空上一次timer
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                this.content = e.target.value
            }, 350)
        },

        async submit() {
            // 文章列表、点赞、关注、草稿
            // user => article 一对多
            let ret = await this.$http.post('/article/create', {
                content: this.content,
                // 显示只读取这个
                compiledContent: this.compiledContent
            })
        },

        bindEvents() {
            // 监听粘贴事件
            this.$refs.editorRef.addEventListener('paste', async e => {
                const files = e.clipboardData.files
                // 直接上传

            })

            // 监听拖拽事件
            this.$refs.editorRef.addEventListener('drop', async e => {
                const files = e.dataTransfer.files
                // 阻止默认事件
                e.preventDefault()
            })
        }
    },
    mounted() {
        this.timer = null
        this.bindEvents()

        // marked拓展
        marked.setOptions({
            rendered: new marked.Renderer(),
            highlight(code){
                return hljs.highlightAuto(code).value
            }
        })
    }
}
</script>

<style scoped>
.md-editor {
    width: 100%;
    height: 100vh;
    outline: none;
}
.write-btn {
    position: fixed;
    z-index: 100;
    right: 30px;
    top: 10px;
}
</style>