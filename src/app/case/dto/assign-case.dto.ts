import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Department } from "@prisma/client";

export class AssignCaseDto {
  @ApiProperty({ enum: Department })
  @IsEnum(Department)
  @IsNotEmpty()
  department: Department;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  actionTaken: string;
}
