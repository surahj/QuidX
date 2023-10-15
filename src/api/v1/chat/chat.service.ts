import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ChatService {
  constructor(private readonly cofigService: ConfigService) {}
  private readonly apiKey = this.cofigService.getOrThrow('OPEN_AI_KEY');

  public async getCompletions(message: string) {
    const prompt = `You are a crypto and investment AI. You will be provided with questions input by users. The question will be delimited by triple quotes.
    The questions will range from cryptocurrency trading, investment, forex, and stock trading. Respond as informative, humanly, and emotionally possible. The maximum token you can expend is 500. Break the answer into different sections and present the sections in HTML format without the <html> and <body> tags.
    """ ${message} """`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo-16k',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
    );

    return response.data;
  }
}
