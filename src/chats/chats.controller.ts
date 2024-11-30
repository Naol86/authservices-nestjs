import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatsGuard } from './chats.guard';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  @Get()
  getChats() {
    return { message: 'hello world of chat' };
  }

  @Get('/:id')
  @UseGuards(ChatsGuard)
  getChat(@Param('id') id: string) {
    return { message: `one chat detail ${id}` };
  }

  @Post()
  createChat() {
    return { message: 'create a chat' };
  }
}
