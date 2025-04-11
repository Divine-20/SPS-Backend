import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { CreateOperatorDto } from "./dto/create-operator.dto";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OperatorService {
  constructor(private prisma: PrismaService) {}

  async createOperator(createOperatorDto: CreateOperatorDto) {
    const {
      email,
      password,
      phoneNumber,
      firstName,
      lastName,
      nationalId,
      passportNumber,
      rank,
      serviceId,
    } = createOperatorDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to ensure both user and operator are created
    return this.prisma.$transaction(async (tx) => {
      // Create the base user first
      const user = await tx.user.create({
        data: {
          email,
          phoneNumber,
          firstName,
          lastName,
          nationalId,
          passportNumber,
          password: hashedPassword,
          role: Role.OPERATOR,
        },
      });

      const operator = await tx.operator.create({
        data: {
          userId: user.id,
          rank,
          serviceId,
        },
        include: {
          user: true,
          service: true,
        },
      });

      return operator;
    });
  }

  async findOperatorById(id: string) {
    return this.prisma.operator.findUnique({
      where: { id },
      include: {
        user: true,
        service: true,
      },
    });
  }

  async findAllOperators() {
    return this.prisma.operator.findMany({
      include: {
        user: true,
        service: true,
      },
    });
  }

  async deleteOperator(id: string) {
    const operator = await this.prisma.operator.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!operator) {
      throw new Error("Operator not found");
    }

    // Delete the user (this will cascade delete the operator due to the relation)
    return this.prisma.user.delete({
      where: { id: operator.userId },
    });
  }
}
