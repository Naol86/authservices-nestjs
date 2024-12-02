import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsGuard } from './chats.guard';
import { AiModule } from 'src/ai/ai.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [AiModule, UsersModule],
  providers: [ChatsService, ChatsGuard],
  controllers: [ChatsController],
})
export class ChatsModule {}
