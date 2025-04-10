import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Case, User, Role } from "@prisma/client";

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createEmergencyNotification(case_: Case, recipient: User) {
    // Get location details with parent hierarchy
    const location = await this.prisma.geoLocation.findUnique({
      where: { id: case_.geoLocationId },
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
    });

    // Extract location hierarchy
    const locationHierarchy = {
      village: location?.name,
      cell: location?.parentGeoLocation?.name,
      sector: location?.parentGeoLocation?.parentGeoLocation?.name,
      district:
        location?.parentGeoLocation?.parentGeoLocation?.parentGeoLocation?.name,
    };

    // Create notification for the specific recipient
    await this.prisma.notification.create({
      data: {
        title: `New ${case_.caseType} Emergency`,
        content: `Emergency reported in ${locationHierarchy.village}, ${locationHierarchy.sector} Sector`,
        metadata: {
          caseType: case_.caseType,
          location: case_.geoLocationId,
          reportedAt: case_.createdAt,
          locationDetails: locationHierarchy,
        },
        caseId: case_.id,
        recipientId: recipient.id,
      },
    });

    // If recipient is not an admin, also notify all admins
    if (recipient.role !== Role.ADMIN) {
      const admins = await this.prisma.user.findMany({
        where: { role: Role.ADMIN },
      });

      for (const admin of admins) {
        if (admin.id !== recipient.id) {
          await this.prisma.notification.create({
            data: {
              title: `New ${case_.caseType} Emergency`,
              content: `Emergency reported in ${locationHierarchy.village}, ${locationHierarchy.sector} Sector`,
              metadata: {
                caseType: case_.caseType,
                location: case_.geoLocationId,
                reportedAt: case_.createdAt,
                locationDetails: locationHierarchy,
              },
              caseId: case_.id,
              recipientId: admin.id,
            },
          });
        }
      }
    }
  }

  async createAssignmentNotification(
    case_: Case,
    recipient: User,
    actionTaken: string
  ) {
    // Get location details with parent hierarchy
    const location = await this.prisma.geoLocation.findUnique({
      where: { id: case_.geoLocationId },
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
    });

    const locationHierarchy = {
      village: location?.name,
      cell: location?.parentGeoLocation?.name,
      sector: location?.parentGeoLocation?.parentGeoLocation?.name,
      district:
        location?.parentGeoLocation?.parentGeoLocation?.parentGeoLocation?.name,
    };

    // Create notification for the assigned department
    await this.prisma.notification.create({
      data: {
        title: `Case Assigned: ${case_.caseType}`,
        content: `A new case in ${locationHierarchy.village}, ${locationHierarchy.sector} Sector has been assigned to your department`,
        metadata: {
          caseType: case_.caseType,
          location: case_.geoLocationId,
          assignedAt: new Date(),
          actionTaken,
          locationDetails: locationHierarchy,
        },
        caseId: case_.id,
        recipientId: recipient.id,
      },
    });

    // Get department users
    const departmentUsers = await this.prisma.user.findMany({
      where: {
        role: this.mapDepartmentToRole(case_.assignedDepartment),
      },
    });

    // Notify department users
    for (const user of departmentUsers) {
      if (user.id !== recipient.id) {
        await this.prisma.notification.create({
          data: {
            title: `New Case Assignment: ${case_.caseType}`,
            content: `A new case in ${locationHierarchy.village}, ${locationHierarchy.sector} Sector has been assigned to your department`,
            metadata: {
              caseType: case_.caseType,
              location: case_.geoLocationId,
              assignedAt: new Date(),
              actionTaken,
              locationDetails: locationHierarchy,
            },
            caseId: case_.id,
            recipientId: user.id,
          },
        });
      }
    }

    // Notify admins
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
    });

    for (const admin of admins) {
      if (admin.id !== recipient.id) {
        await this.prisma.notification.create({
          data: {
            title: `Case Assignment Update: ${case_.caseType}`,
            content: `Case in ${locationHierarchy.village}, ${locationHierarchy.sector} Sector has been assigned to ${case_.assignedDepartment}`,
            metadata: {
              caseType: case_.caseType,
              location: case_.geoLocationId,
              assignedAt: new Date(),
              actionTaken,
              assignedTo: case_.assignedDepartment,
              locationDetails: locationHierarchy,
            },
            caseId: case_.id,
            recipientId: admin.id,
          },
        });
      }
    }
  }

  private mapDepartmentToRole(department: string | null): Role {
    const mapping: Record<string, Role> = {
      RNP: Role.RNP,
      FIRE_DEPARTMENT: Role.FIRE_DEPARTMENT,
      ENVIRONMENTAL_DEPARTMENT: Role.ENVIRONMENTAL_DEPARTMENT,
      RED_CROSS: Role.RED_CROSS,
    };
    return mapping[department] || Role.ADMIN;
  }
  async getAllNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        recipientId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        case: {
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
        },
      },
    });
  }

  async getUnreadNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        case: {
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
        },
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.update({
      where: {
        id: notificationId,
        recipientId: userId,
      },
      data: {
        isRead: true,
      },
    });
  }
}
