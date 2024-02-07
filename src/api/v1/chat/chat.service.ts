import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatRepository } from './chat.repository';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  private openai;
  constructor(
    private readonly cofigService: ConfigService,
    private readonly chatRepository: ChatRepository,
  ) {
    this.openai = new OpenAI({
      apiKey: this.cofigService.getOrThrow('OPEN_AI_KEY'),
    });
  }

  private readonly logger = new Logger(ChatService.name);

  public async publicCompletions(question: string) {
    const prompt = `You are a crypto and investment AI. You will be provided with questions input by users.
     The questions will range from cryptocurrency trading, investment, forex, and stock trading. Respond as informative, humanly, and emotionally possible. 
     The maximum token you can expend is 500. Break the answer into different sections and present the sections in HTML format without the <html> and <body> tags.`;

    const systemMessage = {
      role: 'system',
      content: prompt,
    };

    try {
      const openaiResponse = await this.openai.chat.completions.create({
        messages: [systemMessage, { role: 'user', content: question }],
        model: 'gpt-3.5-turbo-1106',
        temperature: 0.2,
        max_tokens: 1200,
      });
      this.logger.log(openaiResponse);

      const response = {
        role: openaiResponse.choices[0].message.role,
        content: openaiResponse.choices[0].message.content,
      };

      return response.content;
    } catch (error) {
      this.logger.error(error);
      if (error.code === 'context_length_exceeded') {
        throw new HttpException('Token limit exceeded', HttpStatus.BAD_REQUEST);
      } else if (error.code === 502 || error.code === 503) {
        throw new HttpException(
          'Server Error from openai',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new InternalServerErrorException('internal server error');
    }
  }

  public async getCompletions(
    { question, chatId }: UpdateChatDto,
    userSession: { id: string; email: string },
  ) {
    const prompt = `You are a crypto and investment AI. You will be provided with questions input by users.
     The questions will range from cryptocurrency trading, investment, forex, and stock trading. Respond as informative, humanly, and emotionally possible. 
     The maximum token you can expend is 500. Break the answer into different sections. bold, list, add new line, header and spacing where neccessary and present the sections in HTML format only without the <html> and <body> tags.`;

    if (!chatId) {
      const titleResponse = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'you will be provided with a question, generate a nice plain text title from the question. The title should be 3 to 4 words without any quotes',
          },
          { role: 'user', content: question },
        ],
        model: 'gpt-3.5-turbo-1106',
        temperature: 0.3,
        max_tokens: 15,
      });
      const title = titleResponse.choices[0].message.content;
      const newChat = await this.createChat(userSession, title);
      chatId = newChat.id;
    }
    await this.chatRepository.createMessage(chatId, 'user', question);
    const chatHistory =
      await this.chatRepository.getMessagesByChatIdOrderedByTimestamp(chatId);

    const systemMessage = {
      role: 'system',
      content: prompt,
    };

    try {
      const openaiResponse = await this.openai.chat.completions.create({
        messages: [systemMessage, ...chatHistory],
        model: 'gpt-3.5-turbo-1106',
        temperature: 0.2,
        max_tokens: 1000,
      });
      this.logger.log(openaiResponse);

      const response = {
        role: openaiResponse.choices[0].message.role,
        content: openaiResponse.choices[0].message.content,
      };
      const chat = await this.chatRepository.createMessage(
        chatId,
        response.role,
        response.content,
      );

      return { content: chat.content, chatId };
    } catch (error) {
      this.logger.error(error);
      if (error.code === 'context_length_exceeded') {
        throw new HttpException('Token limit exceeded', HttpStatus.BAD_REQUEST);
      } else if (error.code === 502 || error.code === 503) {
        throw new HttpException(
          'Server Error from openai',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new InternalServerErrorException('internal servers error');
    }
  }

  public async createChat(
    userSession: { id: string; email: string },
    title?: string,
  ) {
    const chat = await this.chatRepository.create({
      data: {
        user: {
          connect: { id: userSession.id },
        },
        title: title || 'New Chat',
      },
    });

    return chat;
  }

  public async getChatMessages(chatId: string) {
    const chatMessages =
      await this.chatRepository.getMessagesByChatIdOrderedByTimestamp(chatId);

    return chatMessages;
  }

  public async getChats(userId: string) {
    const chats = await this.chatRepository.findChatByUserId(userId);

    return chats;
  }

  public async updateChatTitle(chatId: string, title: string) {
    const data = await this.chatRepository.findChatByIdAndUpdate(chatId, {
      title,
    });

    return data;
  }

  public async deleteChat(chatId: string) {
    const chats = await this.chatRepository.deleteChatById(chatId);

    return chats;
  }
}
