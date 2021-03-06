# nuxt-eggjs-practice
Nuxt是基于Vue的SSR应用框架，通过对客户端/服务端基础架构的抽象组织，使得能够相之前开发Vue应用一样开发。同时Nuxt还提供了SPA和静态化能力。被称为通用应用框架。
# SSR
Nuxt提供页面级的asyncData和fetch方法在服务端、客户端组件渲染之前异步获取数据并更新页面data以及store中的数据，提供页面级的head方法和nuxt.config.js中的head属性来配置当前页面全局的头部标签。以此来实现对seo的需求。

# 使用背景
vue单页面应用渲染是从服务器获取所需js，在客户端将其解析生成html挂载于 id为app的DOM元素上，这样会存在两大问题：

由于资源请求量大，造成网站首屏加载缓慢，不利于用户体验。

由于页面内容通过js插入，对于内容性网站来说，搜索引擎无法抓取网站内容，不利于SEO。 Nuxt预设了利用Vue.js开发服务端渲染的应用所需要的各种配置。可以将html在服务端渲染，合成完整的html文件再输出到浏览器。

# 初始化
npx create-nuxt-app 项目名

# pages及路由的组织
Nuxt依据pages目录结构自动生成vue-router的路由配置 pages文件夹和页面组件的命名上尽量采用简单清晰复合语义及使用场景的全小写命名

# 组件 components 
大驼峰命名

基础组件 baseComponents 供整个项目使用的基础组件 button input等针对特定UI和业务逻辑进行的组件封装 Base命名前缀

公共组件 commonComponents Header Footer Pc M命名前缀 Common

页面及组件 pageComponents 对具体页面进行组件拆分形成的组件 如首页中的各个部分

# layout布局组件
对layouts/文件夹下添加default.vue组件对其进行拓展，比如统一的背景色，通用的业务逻辑，对错误页面的定制404 500 => error.vue

# apis/
封装一个request.js的模块得以将所有API统筹至一起方便统一管理

# server
入口文件和Nuxt配置文件nuxt.config.js

1、import and set Nuxt.js options

2、init Nuxt.js

3、build only in dev mode

4、give nuxt middleware to express

5、listen the server


# nuxt与vue区别

路由 nuxt按照 pages 文件夹的目录结构自动生成路由； vue需在 src/router/index.js 手动配置路由

入口页面 nuxt页面入口为 layouts/default.vue； vue页面入口为 src/App.vue

webpack配置 nuxt内置webpack，允许根据服务端需求，在 nuxt.config.js 中的build属性自定义构建webpack的配置，覆盖默认配置； vue关于webpack的配置存放在build文件夹下

