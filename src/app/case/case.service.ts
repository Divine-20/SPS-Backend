import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCaseDto } from "./dto/create-case.dto";
import { AssignCaseDto } from "./dto/assign-case.dto";
import { NotificationService } from "../notification/notification.service";
import { Role, CaseStatus, Department, CaseType } from "@prisma/client";
import {
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  endOfWeek,
  getWeeksInMonth,
  format,
} from "date-fns";
import {
  AnalyticsResponse,
  WeeklyAnalytics,
} from "./interfaces/analytics.interface";

// Define the Multer file interface
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
export class CaseService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) {}

  async getMonthlyAnalytics(year?: number): Promise<AnalyticsResponse> {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const cases = await this.prisma.case.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        caseType: true,
        status: true,
      },
    });

    // Initialize monthly data
    const monthlyData = Array(12).fill(0);
    const caseTypeData: Record<CaseType, number> = Object.values(
      CaseType
    ).reduce(
      (acc, type) => ({ ...acc, [type]: 0 }),
      {} as Record<CaseType, number>
    );
    const statusData: Record<CaseStatus, number> = Object.values(
      CaseStatus
    ).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<CaseStatus, number>
    );

    // Process cases
    cases.forEach((case_) => {
      const month = new Date(case_.createdAt).getMonth();
      monthlyData[month]++;
      caseTypeData[case_.caseType]++;
      statusData[case_.status]++;
    });

    return {
      monthly: monthlyData,
      byType: caseTypeData,
      byStatus: statusData,
      total: cases.length,
    };
  }

  async getWeeklyAnalytics(
    year?: number,
    month?: number
  ): Promise<AnalyticsResponse> {
    const currentDate = new Date();
    const selectedYear = year || currentDate.getFullYear();
    const selectedMonth = month !== undefined ? month : currentDate.getMonth();

    // Get the start and end of the selected month
    const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
    const monthEnd = endOfMonth(monthStart);

    // Get the number of weeks in the month
    const numberOfWeeks = getWeeksInMonth(monthStart);

    // Get all weeks in the month
    const weeks = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 } // Week starts on Monday
    );

    // Get cases for the month
    const cases = await this.prisma.case.findMany({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        createdAt: true,
        caseType: true,
        status: true,
      },
    });

    // Initialize weekly data with correct number of weeks
    const weeklyData: WeeklyAnalytics[] = weeks
      .slice(0, numberOfWeeks)
      .map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        // Ensure weekEnd doesn't exceed monthEnd
        const adjustedWeekEnd = weekEnd > monthEnd ? monthEnd : weekEnd;

        return {
          weekNumber: index + 1,
          startDate: format(weekStart, "yyyy-MM-dd"),
          endDate: format(adjustedWeekEnd, "yyyy-MM-dd"),
          count: 0,
        };
      });

    // Initialize type and status counters
    const caseTypeData: Record<CaseType, number> = Object.values(
      CaseType
    ).reduce(
      (acc, type) => ({ ...acc, [type]: 0 }),
      {} as Record<CaseType, number>
    );
    const statusData: Record<CaseStatus, number> = Object.values(
      CaseStatus
    ).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<CaseStatus, number>
    );

    // Process cases
    cases.forEach((case_) => {
      const caseDate = new Date(case_.createdAt);
      const weekIndex = weeks.findIndex((weekStart, index) => {
        if (index >= numberOfWeeks) return false;
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const adjustedWeekEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
        return caseDate >= weekStart && caseDate <= adjustedWeekEnd;
      });

      if (weekIndex !== -1 && weekIndex < numberOfWeeks) {
        weeklyData[weekIndex].count++;
      }

      caseTypeData[case_.caseType]++;
      statusData[case_.status]++;
    });

    return {
      weekly: weeklyData,
      byType: caseTypeData,
      byStatus: statusData,
      total: cases.length,
    };
  }

  private groupCasesByType(cases: any[]): Record<CaseType, number> {
    return cases.reduce(
      (acc, case_) => ({
        ...acc,
        [case_.caseType]: (acc[case_.caseType] || 0) + 1,
      }),
      {} as Record<CaseType, number>
    );
  }

  private groupCasesByStatus(cases: any[]): Record<CaseStatus, number> {
    return cases.reduce(
      (acc, case_) => ({
        ...acc,
        [case_.status]: (acc[case_.status] || 0) + 1,
      }),
      {} as Record<CaseStatus, number>
    );
  }

  private canAssignCases(role: Role): boolean {
    const allowedRoles: Role[] = [
      Role.ADMIN,
      Role.DISTRICT_REPRESENTATIVE,
      Role.SECTOR_REPRESENTATIVE,
    ];
    return allowedRoles.includes(role);
  }

  async create(createCaseDto: CreateCaseDto, images?: MulterFile[]) {
    const {
      nationalId,
      firstName,
      lastName,
      phoneNumber,
      reporterGeoLocationId,
      emergencyGeoLocationId,
      ...caseData
    } = createCaseDto;

    // Verify reporter location exists
    const reporterLocation = await this.prisma.geoLocation.findUnique({
      where: { id: reporterGeoLocationId },
    });

    if (!reporterLocation) {
      throw new NotFoundException(
        `Reporter location with ID ${reporterGeoLocationId} not found`
      );
    }

    // Verify emergency location exists
    const emergencyLocation = await this.prisma.geoLocation.findUnique({
      where: { id: emergencyGeoLocationId },
    });

    if (!emergencyLocation) {
      throw new NotFoundException(
        `Emergency location with ID ${emergencyGeoLocationId} not found`
      );
    }

    // Find or create reporter
    let reporter = await this.prisma.reporter.findUnique({
      where: { nationalId },
    });

    if (!reporter) {
      reporter = await this.prisma.reporter.create({
        data: {
          nationalId,
          firstName,
          lastName,
          phoneNumber,
          geoLocationId: reporterGeoLocationId,
        },
      });
    }

    // Create case with images and set initial status to PENDING
    const newCase = await this.prisma.case.create({
      data: {
        ...caseData,
        status: CaseStatus.PENDING,
        reporterId: reporter.id,
        geoLocationId: emergencyGeoLocationId,
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
        address: true,
        reporter: true,
        images: true,
      },
    });

    // Get all parent locations of the emergency location
    const parentLocations = await this.getParentLocations(
      emergencyGeoLocationId
    );

    // Get users based on location hierarchy and case type
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            geoLocationId: {
              in: parentLocations.map((loc) => loc.id),
            },
          },
          {
            role: {
              in: [
                Role.VILLAGE_REPRESENTATIVE,
                Role.CELL_REPRESENTATIVE,
                Role.SECTOR_REPRESENTATIVE,
                Role.DISTRICT_REPRESENTATIVE,
                Role.ADMIN,
              ],
            },
          },
        ],
      },
    });

    // Create notifications for each user
    for (const user of users) {
      await this.notificationService.createEmergencyNotification(newCase, user);
    }

    return this.getCompleteCase(newCase.id);
  }

  async assignCase(id: string, assignCaseDto: AssignCaseDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { address: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check if user has permission to assign cases
    if (!this.canAssignCases(user.role)) {
      throw new ForbiddenException(
        "Only District Representatives, Sector Representatives, and Admins can assign cases"
      );
    }

    const case_ = await this.prisma.case.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!case_) {
      throw new NotFoundException("Case not found");
    }

    // Update case with assignment details
    const updatedCase = await this.prisma.case.update({
      where: { id },
      data: {
        status: CaseStatus.IN_PROGRESS,
        assignedDepartment: assignCaseDto.department,
        actionTaken: assignCaseDto.actionTaken,
      },
    });

    // Notify assigned department users
    const departmentUsers = await this.prisma.user.findMany({
      where: {
        role: this.mapDepartmentToRole(assignCaseDto.department),
      },
    });

    for (const departmentUser of departmentUsers) {
      await this.notificationService.createAssignmentNotification(
        updatedCase,
        departmentUser,
        assignCaseDto.actionTaken
      );
    }

    return this.getCompleteCase(id);
  }

  async resolveCase(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { address: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const case_ = await this.prisma.case.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!case_) {
      throw new NotFoundException("Case not found");
    }

    // Only assigned department users or admins can resolve cases
    if (
      user.role !== Role.ADMIN &&
      this.mapDepartmentToRole(case_.assignedDepartment) !== user.role
    ) {
      throw new ForbiddenException(
        "Only assigned department users or admins can resolve cases"
      );
    }

    // Update case status to RESOLVED
    const updatedCase = await this.prisma.case.update({
      where: { id },
      data: {
        status: CaseStatus.RESOLVED,
      },
    });

    // Create resolution notification
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

    // Notify relevant users about case resolution
    const notifyUsers = await this.prisma.user.findMany({
      where: {
        OR: [
          { role: Role.ADMIN },
          { role: this.mapDepartmentToRole(case_.assignedDepartment) },
          {
            AND: [
              { geoLocationId: case_.geoLocationId },
              {
                role: {
                  in: [
                    Role.VILLAGE_REPRESENTATIVE,
                    Role.CELL_REPRESENTATIVE,
                    Role.SECTOR_REPRESENTATIVE,
                    Role.DISTRICT_REPRESENTATIVE,
                  ],
                },
              },
            ],
          },
        ],
      },
    });

    for (const notifyUser of notifyUsers) {
      await this.prisma.notification.create({
        data: {
          title: `Case Resolved: ${case_.caseType}`,
          content: `Case in ${locationHierarchy.village}, ${locationHierarchy.sector} Sector has been marked as resolved`,
          metadata: {
            caseType: case_.caseType,
            location: case_.geoLocationId,
            resolvedAt: new Date(),
            locationDetails: locationHierarchy,
            resolvedBy: {
              id: user.id,
              role: user.role,
            },
          },
          caseId: case_.id,
          recipientId: notifyUser.id,
        },
      });
    }

    return this.getCompleteCase(id);
  }

  private mapDepartmentToRole(department: Department): Role {
    const mapping: Record<Department, Role> = {
      [Department.RNP]: Role.RNP,
      [Department.FIRE_DEPARTMENT]: Role.FIRE_DEPARTMENT,
      [Department.ENVIRONMENTAL_DEPARTMENT]: Role.ENVIRONMENTAL_DEPARTMENT,
      [Department.RED_CROSS]: Role.RED_CROSS,
    };
    return mapping[department];
  }

  private async getParentLocations(geoLocationId: string) {
    const locations = [];
    let currentLocationId = geoLocationId;

    while (currentLocationId) {
      const location = await this.prisma.geoLocation.findUnique({
        where: { id: currentLocationId },
      });

      if (!location) break;

      locations.push(location);
      currentLocationId = location.parentGeoLocationId;
    }

    return locations;
  }

  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { address: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // For admin and police, return all cases
    if (user.role === Role.ADMIN || user.role === Role.RNP) {
      return this.prisma.case.findMany({
        include: {
          reporter: {
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
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // For other roles, get their jurisdiction
    const childLocations = await this.getChildLocations(user.address.id);
    const locationIds = [
      user.address.id,
      ...childLocations.map((loc) => loc.id),
    ];

    return this.prisma.case.findMany({
      where: {
        OR: [
          {
            geoLocationId: {
              in: locationIds,
            },
          },
          {
            assignedDepartment: this.mapRoleToDepartment(user.role),
          },
        ],
      },
      include: {
        reporter: {
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
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  private mapRoleToDepartment(role: Role): Department | undefined {
    const mapping: Partial<Record<Role, Department>> = {
      [Role.RNP]: Department.RNP,
      [Role.FIRE_DEPARTMENT]: Department.FIRE_DEPARTMENT,
      [Role.ENVIRONMENTAL_DEPARTMENT]: Department.ENVIRONMENTAL_DEPARTMENT,
      [Role.RED_CROSS]: Department.RED_CROSS,
    };
    return mapping[role];
  }

  async findOne(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { address: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const case_ = await this.getCompleteCase(id);

    if (!case_) {
      throw new NotFoundException("Case not found");
    }

    // Admin and police can view all cases
    if (user.role === Role.ADMIN || user.role === Role.RNP) {
      return case_;
    }

    // Users can view cases assigned to their department
    if (case_.assignedDepartment === this.mapRoleToDepartment(user.role)) {
      return case_;
    }

    // For other roles, check if the case is in their jurisdiction
    const userLocations = await this.getParentLocations(user.address.id);
    const userLocationIds = userLocations.map((loc) => loc.id);

    if (!userLocationIds.includes(case_.address.id)) {
      throw new ForbiddenException(
        "You do not have permission to view this case"
      );
    }

    return case_;
  }

  private async getCompleteCase(id: string) {
    return this.prisma.case.findUnique({
      where: { id },
      include: {
        reporter: {
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
        images: true,
      },
    });
  }

  private async getChildLocations(geoLocationId: string) {
    return this.prisma.geoLocation.findMany({
      where: {
        parentGeoLocationId: geoLocationId,
      },
    });
  }
}
