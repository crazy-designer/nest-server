import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { CommonModule } from 'libs/common';
import { AuthModule } from './auth/auth.module';
import { RedisCacheService } from './redis/redis.service';

@Module({
  imports: [CommonModule, AuthModule, UserModule, RoleModule],
  controllers: [AdminController],
  providers: [AdminService, RedisCacheService],
})
export class AdminModule {}
