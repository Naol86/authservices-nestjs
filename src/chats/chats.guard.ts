import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatsGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const chatId = request.params.id;
    const userId = request.user.id;
    // any validation logic here
    const chat = await this.prisma.chats.findUnique({
      where: {
        id: chatId,
      },
    });
    if (!chat || chat.user_id !== userId) {
      return false;
    }

    return true;
  }
}
