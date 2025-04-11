import { Role } from "@prisma/client";
import { CreateUserDto } from "src/app/user/dto/create-user.dto";

export class CreateOperatorDto extends CreateUserDto {
  rank: string;
  serviceId: string;
  role: Role = Role.OPERATOR;
}
