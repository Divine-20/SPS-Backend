import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;

  constructor(private configService: ConfigService) {
    this.client = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendSMS(to: string, body: string) {
    try {
      await this.client.messages.create({
        body,
        to,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  }
}