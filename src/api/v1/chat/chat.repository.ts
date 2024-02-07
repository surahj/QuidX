import { Injectable } from '@nestjs/common';
import { PostgresPrismaService } from '@database/postgres-prisma.service';
import { Prisma } from '@prisma/postgres/client';

@Injectable()
export class ChatRepository {
  constructor(private readonly postgresPrismaService: PostgresPrismaService) {}

  public async create(query: Prisma.ChatCreateArgs) {
    return this.postgresPrismaService.chat.create(query);
  }

  public async find(query: Prisma.ChatFindFirstArgs) {
    return this.postgresPrismaService.chat.findFirst(query);
  }

  public async findById(id: string) {
    return this.postgresPrismaService.chat.findUnique({
      where: { id },
    });
  }

  public async findChatByUserId(userId: string) {
    return this.postgresPrismaService.chat.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
      },
    });
  }

  public async findChatByIdAndUpdate(
    chatId: string,
    data: Prisma.ChatUpdateInput,
    options?: Partial<{
      /**  if `true` include user from clients table that is related to this chat (default is `false`)  */
      includeUser: boolean;
    }>,
  ) {
    return this.postgresPrismaService.chat.update({
      where: { id: chatId },
      data,
      include: {
        user: options?.includeUser || false,
      },
    });
  }

  public async deleteChatById(chatId: string) {
    return this.postgresPrismaService.chat.delete({
      where: { id: chatId },
    });
  }

  async createMessage(chatId: string, role: string, content: string) {
    return this.postgresPrismaService.message.create({
      data: {
        chat: { connect: { id: chatId } },
        role,
        content,
      },
    });
  }

  async getMessagesByChatIdOrderedByTimestamp(chatId: string) {
    return this.postgresPrismaService.message.findMany({
      where: {
        chatId: chatId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        role: true,
        content: true,
      },
    });
  }

  public async delete(query: Prisma.ChatDeleteArgs) {
    return this.postgresPrismaService.chat.delete(query);
  }

  public async update(query: Prisma.ChatUpdateArgs) {
    return this.postgresPrismaService.chat.update(query);
  }
}
