export enum ApiCodeEnum {
  SUCCESS = 0, // 成功
  TOKEN_OVERDUE = 10001, // token过期
  USER_LOGGED = 10002, // 用户已登录
  PUBLIC_ERROR = 10086, // 常规报错

  NO_FIND_USER = 40001, // 找不到该用户
  USER_PASSWORD_FAILED = 40002, // 用户名或者密码不正确
  SEND_MAILER_ERROR = 40004, // 邮件发送失败
  MAILER_COMPILE_ERROR = 40005, // 验证码有误
}
