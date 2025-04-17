import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { CitizenshipStatus, Role } from "@prisma/client";
import { randomBytes } from "crypto";
import { log } from "console";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const {
      email,
      phoneNumber,
      password,
      nationalId,
      passportNumber,
      role,
      citizenship,
      ticketNumber,
      ...rest
    } = createUserDto;

    // Validate resident/non-resident requirements
    if (citizenship === CitizenshipStatus.RESIDENT && !nationalId) {
      throw new ConflictException("National ID is required for residents");
    }
    if (citizenship === CitizenshipStatus.NON_RESIDENT && !passportNumber) {
      throw new ConflictException(
        "Passport number is required for non-residents"
      );
    }

    // Check for existing user only if we have identifiers
    const searchConditions = [];
    if (email) searchConditions.push({ email });
    if (phoneNumber) searchConditions.push({ phoneNumber });
    if (nationalId) searchConditions.push({ nationalId });
    if (passportNumber) searchConditions.push({ passportNumber });

    if (searchConditions.length > 0) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: searchConditions,
        },
      });

      if (existingUser) {
        throw new ConflictException(
          "User with this email, phone number, national ID, or passport number already exists"
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        ...rest,
        email: email || null,
        phoneNumber: phoneNumber || null,
        password: hashedPassword,
        nationalId: nationalId || null,
        passportNumber: passportNumber || null,
        role: role || Role.REPORTER,
        citizenship: citizenship || CitizenshipStatus.RESIDENT,
        ticketNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
    };
  }
  async findAll() {
    return this.prisma.user.findMany();
  }

  async findByTicketNumber(ticketNumber: string) {
    const user = await this.prisma.user.findUnique({
      where: { ticketNumber },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findByPhoneNumber(phoneNumber: string) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
