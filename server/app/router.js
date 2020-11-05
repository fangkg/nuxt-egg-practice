'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // router.get('/user', controller.user.index);
  // 验证码
  router.get('/captcha', controller.util.captcha);

  // /user/register
  // /user/login
  // /user/follow

  router.group({ name: 'user', prefix: '/user' }, router => {
    const { info, register, login, verify } = controller.user

    router.post('/register', register)
    router.post('./login', login)
    router.get('./inof', info)
    router.get('/verify', verify)
  })
};
