'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt({ app })
  
  router.get('/', controller.home.index);
  // router.get('/user', controller.user.index);
  // 验证码
  router.get('/captcha', controller.util.captcha);
  // 邮箱验证码
  router.get('/sendcode', controller.util.sendcode)
  // 文件上传
  router.post('/uploadfile', controller.util.uploadfile)
  // 文件合并
  router.post('/mergeFile', controller.util.mergeFile)
  // 检查文件是否上传过
  router.post('/checkfile', controller.util.checkfile)

  // /user/register
  // /user/login
  // /user/follow

  router.group({ name: 'user', prefix: '/user' }, router => {
    const { info, register, login, verify } = controller.user

    router.post('/register', register)
    router.post('/login', login)
    router.get('/info', jwt, info)
    router.get('/verify', verify)
    router.get('/detail', jwt, info)
  })
};
