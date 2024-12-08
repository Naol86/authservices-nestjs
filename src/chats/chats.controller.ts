import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatsGuard } from './chats.guard';
import { MessageDto } from './dto/chats.dto';
import { ChatsService } from './chats.service';
import { UsersService } from 'src/users/users.service';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  constructor(
    private userService: UsersService,
    private chatsService: ChatsService,
  ) {}

  @Get()
  async getChats(@Req() req) {
    const user = req.user;
    const chats = await this.chatsService.getChats(user.userId);
    return { success: true, data: chats };
  }

  @Post()
  async chat(@Body() body: MessageDto, @Req() req) {
    if (body.chat_id && (await this.chatsService.checkChat(body.chat_id))) {
      const res = await this.chatsService.chat(body.chat_id, body.content);
      return { success: true, data: res.response };
    }

    const user = req.user;
    if (!user) {
      return { success: false, message: 'user not found' };
    }
    const u = await this.userService.findByEmail(user.email);
    if (!u) {
      return { success: false, message: 'user not found' };
    }
    const chat = await this.chatsService.createChat({
      User: { connect: { id: u.id } },
      title: body.content.substring(0, 45),
    });
    if (!chat) {
      return { success: false, message: 'chat not created' };
    }
    const res = await this.chatsService.chat(chat.id, body.content);
    if (!res) {
      return { success: false, message: 'chat not found' };
    }
    return {
      success: true,
      data: res.response,
      chat_id: chat.id,
      title: chat.title,
      created_at: chat.created_at,
    };
  }

  @Get('/:id')
  @UseGuards(ChatsGuard)
  getChat(@Param('id') id: string) {
    return { message: `one chat detail ${id}` };
  }

  @Get('/:id/messages')
  @UseGuards(ChatsGuard)
  async getChatMessages(@Param('id') id: string) {
    const data = await this.chatsService.getChatMessages(id);
    return { success: true, data };
  }
}
