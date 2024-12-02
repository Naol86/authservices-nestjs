import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class AiService {
  private openai = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  });

  async sendMessages(messages: ChatCompletionMessageParam[]) {
    const response = await this.openai.chat.completions.create({
      model: 'grok-beta',
      temperature: 0.5,
      messages,
    });

    return {
      response: response.choices[0].message,
    };
  }
}
