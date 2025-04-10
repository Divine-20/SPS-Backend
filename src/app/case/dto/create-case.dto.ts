import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsArray,
  IsOptional,
} from "class-validator";
import { CaseType } from "@prisma/client";

export class CreateCaseDto {
  @ApiProperty({ enum: CaseType })
  @IsEnum(CaseType)
  caseType: CaseType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cause: string;

  @ApiProperty()
  @IsDateString()
  startingTime: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reporterGeoLocationId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  emergencyGeoLocationId: string;

  @ApiProperty()
  @IsString()
  nationalId: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    required: false,
  })
  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[];
}
