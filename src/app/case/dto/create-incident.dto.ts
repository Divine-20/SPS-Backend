import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsArray,
  IsOptional,
  IsEmail,
  ValidateIf,
} from "class-validator";

export class CreateIncidentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty()
  @IsDateString()
  startingTime: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsString()
  actionTaken?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  emergencyGeoLocationId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiProperty()
  @ValidateIf((o) => !o.nationalId && !o.passportNumber && !o.email)
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @ValidateIf((o) => !o.nationalId && !o.passportNumber && !o.email)
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email?: string;

  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    required: false,
  })
  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[];
}
