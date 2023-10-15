import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';
import { messageDto } from './dto/message.dto';
// import { AuthenticatedUserInterceptor } from '@common/interceptors/authenticated-user.interceptor';

@ApiTags('chat')
@Controller('chat')
// @UseInterceptors(AuthenticatedUserInterceptor)
export class ChatController {
  constructor(private readonly openaiService: ChatService) {}

  @Post('completions')
  async getCompletions(@Body() payload: messageDto) {
    const answer = await this.openaiService.getCompletions(payload.message);

    return {
      statusCode: 200,
      message: 'success',
      data: { question: payload.message, answer },
    };
  }
}
