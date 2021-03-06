import type { User } from '@libs/db/entity/UserEntity';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'libs/common/decorator/current-user.decorator';
import { returnClient } from 'libs/common/return/returnClient';
import { ApiCodeEnum } from 'libs/common/utils/apiCodeEnum';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/CreatUserDto';
import { CreateEmailDto, VerifyEmailDto } from './dto/EmailDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { UserService } from './user.service';
import fetch from 'node-fetch';

@Controller('user')
@ApiTags('users')
export class UserController {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: '用户注册',
  })
  public async createUser(@Body() createUserDto: CreateUserDto) {
    const userInfo: User = await this.userService.findSpecifiedUser(
      createUserDto.name,
    );
    console.log(createUserDto, userInfo);
    if (userInfo) {
      return {
        message: '用户名被占用',
        data: userInfo,
        code: -1,
      };
    }
    try {
      await this.userService.createUser(createUserDto);
      return {
        message: '注册成功',
        data: userInfo,
        code: 0,
      };
    } catch (e) {
      return {
        message: e.errorMessage,
        data: userInfo,
        code: -1,
      };
    }
  }

  @Post('login')
  @ApiOperation({
    summary: '测试登录 jwt生成， redis单点验证',
  })
  @UseGuards(AuthGuard('local'))
  public async login(@Body() params: LoginUserDto, @CurrentUser() user) {
    try {
      if (user) {
        const { name, id } = user;
        const token = await this.authService.creatToken({
          name,
          id,
        });
        await this.authService.createRedisByToken({
          name,
          id,
          token: token.accessToken,
        });
        return returnClient('登录成功', ApiCodeEnum.SUCCESS, { token });
      }
    } catch (error) {}
    return { params };
  }

  @Get('test')
  public async test() {
    console.log({ configService: this.configService, pre: process.env.SECRET });
    return {};
  }

  @Post('sendEmailer')
  @ApiOperation({
    summary: '发送邮箱验证码',
  })
  public async sendEmailerCode(@Body() { email, name }: CreateEmailDto) {
    const res = await this.userService.sendMailerByCode(email, name);
    return returnClient('发送成功', ApiCodeEnum.SUCCESS, res);
  }

  @Post('verifyCode')
  @ApiOperation({
    summary: '校验邮箱验证码',
  })
  public async verifyEmailCode(@Body() { email, value }: VerifyEmailDto) {
    const res = await this.userService.verifyEmailerCode(email, value);
    if (res) {
      return returnClient('验证通过', ApiCodeEnum.SUCCESS, { verify: res });
    }
    return returnClient(
      '验证码有误，请重新输入',
      ApiCodeEnum.MAILER_COMPILE_ERROR,
      {
        verify: res,
      },
    );
  }

  @Get('tuweiqinghua')
  @ApiOperation({
    summary: '获取一句土味情话',
  })
  public async tuwei() {
    const res = await fetch('https://chp.shadiao.app/api.php', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'sec-ch-ua':
          '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
        'sec-ch-ua-mobile': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
      },
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      method: 'GET',
    })
      .then((res) => res.text())
      .then((json) => json);
    return returnClient('获取成功', ApiCodeEnum.SUCCESS, { tuwei: res });
  }
}
