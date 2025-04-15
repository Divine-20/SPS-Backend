import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SmsService {
  private readonly PINDO_API_TOKEN: string;

  constructor(private configService: ConfigService) {
    this.PINDO_API_TOKEN = this.configService.get<string>("PINDO_API_TOKEN");
  }

  generateRegistrationMessage(name: string, trackingCode: string): string {
    return `Hello ${name}, thank you for your incident report. Your case ID is ${trackingCode}. Please keep this code for reference.`;
  }

  async sendSingleSms(phoneNumber: string, message: string) {
    // Format phone number if needed
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.startsWith("0")
        ? `+250${formattedPhone.substring(1)}`
        : `+250${formattedPhone}`;
    }

    // Prepare data for Pindo API
    const data = {
      to: formattedPhone,
      text: message,
      sender: "PindoTest", // Your default sender ID
    };

    try {
      // Make API call
      const response = await fetch("https://api.pindo.io/v1/sms/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.PINDO_API_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      // Check response type before parsing JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        throw new Error("Received non-JSON response from API");
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          `SMS API error: ${response.status} ${JSON.stringify(result)}`
        );
      }

      return result;
    } catch (error) {
      console.error("SMS sending error:", error);
      throw error;
    }
  }
}
