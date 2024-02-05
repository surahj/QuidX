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
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateChatDto } from './dto/update-chat.dto';
import { UpdateChatTitleDto } from './dto/update-title.chat.dto';
import { PublicChatDto } from './dto/public-chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

// import { AuthenticatedUserInterceptor } from '@common/interceptors/authenticated-user.interceptor';

@ApiTags('chat')
@Controller('chat')
@ApiBearerAuth('Bearer')
// @UseInterceptors(AuthenticatedUserInterceptor)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // @ApiCookieAuth('Authentication')
  @UseGuards(JwtAuthGuard)
  @Post('completions')
  async getCompletions(@Req() req, @Body() payload: UpdateChatDto) {
    const userSession = { id: req?.user.id, email: req?.user?.email };
    const answer = await this.chatService.getCompletions(payload, userSession);

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

  // @ApiCookieAuth('Authentication')
  @UseGuards(JwtAuthGuard)
  @Post()
  public async createChat(@Req() req) {
    const userSession = { id: req?.user.id, email: req?.user?.email };
    console.log('userSession', userSession);
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

  // @ApiCookieAuth('Authentication')
  @ApiBearerAuth('Bearer')
  @UseGuards(JwtAuthGuard)
  @Get()
  public async getChats(@Req() req) {
    console.log('user');
    const userSession = { id: req?.user.id, email: req?.user?.email };
    const chats = await this.chatService.getChats(userSession.id);

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
