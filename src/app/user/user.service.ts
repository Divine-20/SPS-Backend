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
    const { email, phoneNumber, password, geoLocationId, ...rest } =
      createUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        "User with this email or phone number already exists"
      );
    }

    // Verify geoLocation exists
    const geoLocation = await this.prisma.geoLocation.findUnique({
      where: { id: geoLocationId },
    });

    if (!geoLocation) {
      throw new NotFoundException("GeoLocation not found");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        ...rest,
        email,
        phoneNumber,
        password: hashedPassword,
        geoLocationId,
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
      include: {
        address: {
          include: {
            parentGeoLocation: {
              include: {
                parentGeoLocation: {
                  include: {
                    parentGeoLocation: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Format location hierarchy
    const locationHierarchy = {
      village: user.address?.name,
      cell: user.address?.parentGeoLocation?.name,
      sector: user.address?.parentGeoLocation?.parentGeoLocation?.name,
      district:
        user.address?.parentGeoLocation?.parentGeoLocation?.parentGeoLocation
          ?.name,
    };

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      locationHierarchy,
    };
  }

  async getMapData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        address: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Get all locations under user's jurisdiction
    const jurisdictionLocations = await this.prisma.geoLocation.findMany({
      where: {
        OR: [{ id: user.address.id }, { parentGeoLocationId: user.address.id }],
      },
    });

    // Get all cases in user's jurisdiction
    const cases = await this.prisma.case.findMany({
      where: {
        geoLocationId: {
          in: jurisdictionLocations.map((loc) => loc.id),
        },
      },
      include: {
        address: true,
      },
    });

    return {
      jurisdiction: jurisdictionLocations,
      cases: cases.map((case_) => ({
        id: case_.id,
        type: case_.caseType,
        status: case_.status,
        location: case_.address,
        createdAt: case_.createdAt,
      })),
    };
  }
}
