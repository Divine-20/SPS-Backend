import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, IsObject } from "class-validator";

export class CreateNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  caseId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  recipientId: string;
}
