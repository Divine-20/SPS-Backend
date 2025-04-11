import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

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
      ...rest
    } = createUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }, { nationalId }, { passportNumber }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        "User with this email or phone number or national Id or passport number already exists"
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = createUserDto.role;
    if (!userRole) {
    }

    return this.prisma.user.create({
      data: {
        ...rest,
        email,
        phoneNumber,
        password: hashedPassword,
        nationalId,
        passportNumber,
        ...(role && { role }),
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
}
