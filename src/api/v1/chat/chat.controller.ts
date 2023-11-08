import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Req,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateChatDto } from './dto/update-chat.dto';
import { UpdateChatTitleDto } from './dto/update-title.chat.dto';
import { PublicChatDto } from './dto/public-chat.dto';

// import { AuthenticatedUserInterceptor } from '@common/interceptors/authenticated-user.interceptor';

@ApiTags('chat')
@Controller('chat')
// @UseInterceptors(AuthenticatedUserInterceptor)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('completions')
  async getCompletions(@Body() payload: UpdateChatDto) {
    const answer = await this.chatService.getCompletions(payload);

    return {
      statusCode: 200,
      message: 'success',
      data: { question: payload.question, answer },
    };
  }

  @Post('completions/public')
  async getPublicCompletions(@Body() payload: PublicChatDto) {
    const answer = await this.chatService.publicCompletions(payload.question);

    return {
      statusCode: 200,
      message: 'success',
      data: { question: payload.question, answer },
    };
  }

  @Post()
  public async createChat(@Req() req: Request) {
    const userSession = req.session['user'];
    const data = await this.chatService.createChat(userSession);

    return {
      statusCode: 201,
      message: 'success',
      data: { id: data.id, title: data.title },
    };
  }

  @Get('/:chatId/messages')
  public async getChat(@Param('chatId') chatId: string) {
    const chats = await this.chatService.getChatMessages(chatId);

    return {
      statusCode: 200,
      message: 'success',
      data: chats,
    };
  }

  @Get()
  public async getChats(@Req() req: Request) {
    const { id: userId } = req.session['user'];
    console.log(userId);
    const chats = await this.chatService.getChats(userId);

    return {
      statusCode: 200,
      message: 'success',
      data: chats,
    };
  }

  @Put('/:chatId')
  public async updateChatTitle(
    @Param('chatId') chatId: string,
    @Body() payload: UpdateChatTitleDto,
  ) {
    console.log(payload.title);
    const data = await this.chatService.updateChatTitle(chatId, payload.title);

    return {
      statusCode: 200,
      message: 'success',
    };
  }

  @Delete('/:chatId')
  public async deleteChat(@Param('chatId') chatId: string) {
    console.log(chatId);
    await this.chatService.deleteChat(chatId);

    return {
      statusCode: 200,
      message: 'success',
    };
  }
}
