import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.geoLocation.findMany({
      where: {
        parentGeoLocationId: null, // Get root locations
      },
      include: {
        subGeoLocations: {
          include: {
            subGeoLocations: {
              include: {
                subGeoLocations: {
                  include: {
                    subGeoLocations: true,
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

  async findProvinces() {
    return this.prisma.geoLocation.findMany({
      where: {
        locationType: "PROVINCE",
      },
      // include: {
      //   subGeoLocations: {
      //     include: {
      //       subGeoLocations: {
      //         include: {
      //           subGeoLocations: true,
      //         },
      //       },
      //     },
      //   },
      // },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findByParent(parentId: string) {
    const parent = await this.prisma.geoLocation.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent location with ID ${parentId} not found`
      );
    }

    return this.prisma.geoLocation.findMany({
      where: {
        parentGeoLocationId: parentId,
      },
      // include: {
      //   subGeoLocations: true,
      // },
      orderBy: {
        name: "asc",
      },
    });
  }
}
