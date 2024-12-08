import { Injectable } from '@nestjs/common';
import { Messages, Prisma } from '@prisma/client';
import { ChatCompletionMessageParam } from 'openai/resources';
import { AiService } from 'src/ai/ai.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async checkChat(chatId: string) {
    const chat = await this.prisma.chats.findUnique({
      where: {
        id: chatId,
      },
    });

    if (!chat) {
      return false;
    }

    return true;
  }

  async createChat(chat: Prisma.ChatsCreateInput) {
    const newChat = await this.prisma.chats.create({
      data: chat,
    });

    return newChat;
  }

  async getChatMessages(chatId: string): Promise<Messages[]> {
    return this.prisma.messages.findMany({
      where: {
        chat_id: chatId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getLastChats(chatId: string): Promise<Messages[]> {
    const chats = await this.prisma.messages.findMany({
      where: {
        chat_id: chatId,
      },
      orderBy: {
        created_at: 'asc',
      },
      take: 30,
    });

    return chats;
  }

  async getChats(userId: number) {
    const chats = await this.prisma.chats.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return chats;
  }

  async chat(chatId: string, message: string) {
    const chats = await this.getLastChats(chatId);
    const messages: ChatCompletionMessageParam[] = chats.map((chat) => {
      return {
        role: chat.role,
        content: chat.content,
      };
    });
    messages.push({
      role: 'user',
      content: message,
    });
    const response = await this.aiService.sendMessages(messages);
    if (response) {
      await this.prisma.messages.create({
        data: {
          chat_id: chatId,
          role: 'user',
          content: message,
        },
      });
      await this.prisma.messages.create({
        data: {
          chat_id: chatId,
          role: 'system',
          content: response.response.content,
        },
      });
    }

    return response;
  }
}
