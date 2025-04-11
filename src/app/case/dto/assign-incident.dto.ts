import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AssignIncidentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  actionTaken: string;
}
