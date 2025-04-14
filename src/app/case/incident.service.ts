import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaClient, Prisma, Role, IncidentStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { CreateIncidentDto } from "./dto/create-incident.dto";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Injectable()
export class IncidentService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private generateRandomPassword(): string {
    return randomBytes(16).toString("hex");
  }

  private generateTrackingCode(): string {
    const prefix = "INC";
    const randomPart = randomBytes(3).toString("hex").toUpperCase();
    return `${prefix}-${randomPart}`;
  }

  async create(createIncidentDto: CreateIncidentDto, images?: MulterFile[]) {
    const {
      nationalId,
      passportNumber,
      email,
      phoneNumber,
      firstName,
      lastName,
      serviceId,
      emergencyGeoLocationId,
      startingTime,
      description,
      actionTaken,
      ...rest
    } = createIncidentDto;

    // Find or create reporter
    let reporter = await this.findUserByUniqueIdentifier({
      nationalId,
      phoneNumber,
      email,
      passportNumber,
    });

    if (!reporter) {
      // Generate a random password for new users
      const password = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData: Prisma.UserCreateInput = {
        firstName: firstName || "",
        lastName: lastName || "",
        phoneNumber,
        email: email || "",
        nationalId: nationalId || null,
        passportNumber: passportNumber || null,
        role: Role.REPORTER,
        password: hashedPassword,
      };

      reporter = await this.prisma.user.create({
        data: userData,
      });

      // TODO: Send password to user via SMS or email
      console.log(`Generated password for new user: ${password}`);
    }

    // Create incident with tracking code
    const trackingCode = this.generateTrackingCode();
    const newIncident = await this.prisma.incident.create({
      data: {
        trackingCode,
        startingTime,
        description,
        actionTaken,
        status: IncidentStatus.PENDING,
        user: {
          connect: { id: reporter.id },
        },
        address: {
          connect: { id: emergencyGeoLocationId },
        },
        service: serviceId
          ? {
              connect: { id: serviceId },
            }
          : undefined,
        images: images
          ? {
              createMany: {
                data: images.map((img) => ({
                  url: img.filename,
                })),
              },
            }
          : undefined,
      },
      include: {
        user: true,
        department: true,
        address: true,
        service: true,
        images: true,
        departmentAssignments: {
          include: {
            assignedBy: true,
            department: true,
          },
        },
      },
    });

    return newIncident;
  }

  async assignDepartment(
    incidentId: string,
    departmentId: string,
    assignedById: string
  ) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${incidentId} not found`);
    }

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`
      );
    }

    // Update incident with new department and create assignment record
    const updatedIncident = await this.prisma.$transaction(async (tx) => {
      // Update the incident
      const updated = await tx.incident.update({
        where: { id: incidentId },
        data: {
          department: {
            connect: { id: departmentId },
          },
          status: IncidentStatus.IN_PROGRESS,
          departmentAssignments: {
            create: {
              department: {
                connect: { id: departmentId },
              },
              assignedBy: {
                connect: { id: assignedById },
              },
            },
          },
        },
        include: {
          user: true,
          department: true,
          address: true,
          service: true,
          images: true,
          departmentAssignments: {
            include: {
              assignedBy: true,
              department: true,
            },
          },
        },
      });

      return updated;
    });

    return updatedIncident;
  }

  async findAll() {
    return this.prisma.incident.findMany({
      include: {
        user: true,
        department: true,
        address: true,
        service: true,
        images: true,
        departmentAssignments: {
          include: {
            assignedBy: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
        address: true,
        service: true,
        images: true,
        departmentAssignments: {
          include: {
            assignedBy: true,
            department: true,
          },
        },
      },
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    return incident;
  }

  async findByUser(userId: string) {
    return this.prisma.incident.findMany({
      where: {
        userId,
      },
      include: {
        user: true,
        department: true,
        address: true,
        service: true,
        images: true,
        departmentAssignments: {
          include: {
            assignedBy: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByService(serviceId: string) {
    return this.prisma.incident.findMany({
      where: {
        serviceId,
      },
      include: {
        user: true,
        department: true,
        address: true,
        service: true,
        images: true,
        departmentAssignments: {
          include: {
            assignedBy: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByDepartment(departmentId: string) {
    return this.prisma.incident.findMany({
      where: {
        departmentId,
      },
      include: {
        user: true,
        department: true,
        address: true,
        service: true,
        images: true,
        departmentAssignments: {
          include: {
            assignedBy: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  async findByTrackingCode(trackingCode: string) {
    return this.prisma.incident.findMany({
      where: {
        trackingCode,
      },
      include: {
        department: true,
        address: true,
        service: true,
        images: true,
        departmentAssignments: {
          include: {
            assignedBy: true,
            department: true,
          },
        },
      },
    });
  }

  async findByNationalId(nationalId: string) {
    return this.prisma.incident.findMany({
      where: {
        user: {
          nationalId,
        },
      },
      include: {
        user: true,
        department: true,
        address: true,
        service: true,
        images: true,
        departmentAssignments: {
          include: {
            assignedBy: true,
            department: true,
          },
        },
      },
    });
  }
  async findByPassportNumber(passportNumber: string) {
    return this.prisma.incident.findMany({
      where: {
        user: {
          passportNumber,
        },
      },
      include: {
        user: true,
        department: true,
        address: true,
        service: true,
        images: true,
        departmentAssignments: {
          include: {
            assignedBy: true,
            department: true,
          },
        },
      },
    });
  }
  private async findUserByUniqueIdentifier(identifier: {
    nationalId?: string;
    phoneNumber?: string;
    email?: string;
    passportNumber?: string;
  }) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { nationalId: identifier.nationalId },
          { phoneNumber: identifier.phoneNumber },
          { email: identifier.email },
          { passportNumber: identifier.passportNumber },
        ].filter(Boolean),
      },
    });
  }
}
