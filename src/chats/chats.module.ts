import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsGuard } from './chats.guard';

@Module({
  providers: [ChatsService, ChatsGuard],
  controllers: [ChatsController],
})
export class ChatsModule {}
