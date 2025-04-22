import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      where: {
        parentServiceId: null,
      },
      include: {
        subService: {
          include: {
            subService: {
              include: {
                subService: {
                  include: {
                    subService: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
