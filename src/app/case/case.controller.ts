import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  Patch,
  Res,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CaseService } from "./case.service";
import { CreateCaseDto } from "./dto/create-case.dto";
import { AssignCaseDto } from "./dto/assign-case.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Case } from "./case.entity";
import { diskStorage } from "multer";
import { extname } from "path";
import { Response } from "express";
import * as path from "path";
import * as fs from "fs";

@ApiTags("cases")
@Controller("cases")
export class CaseController {
  constructor(private readonly caseService: CaseService) {}
  @Get("analytics/weekly")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get weekly case analytics for a specific month" })
  @ApiQuery({
    name: "year",
    required: false,
    type: Number,
    description: "Year for analytics data (defaults to current year)",
  })
  @ApiQuery({
    name: "month",
    required: true,
    type: Number,
    description: "Month index (1-12) for weekly analytics", // Adjusted to 1-12 for clarity
  })
  @ApiResponse({
    status: 200,
    description: "Returns weekly analytics data for the specified month",
  })
  async getWeeklyAnalytics(
    @Query("year") year: number,
    @Query("month") month: number
  ) {
    return this.caseService.getWeeklyAnalytics(year, month);
  }

  @Get("analytics/monthly")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get monthly case analytics" })
  @ApiQuery({
    name: "year",
    required: false,
    type: Number,
    description: "Year for analytics data (defaults to current year)",
  })
  @ApiResponse({
    status: 200,
    description: "Returns monthly analytics data",
    schema: {
      type: "object",
      properties: {
        monthly: {
          type: "array",
          items: { type: "number" },
          description: "Array of case counts for each month",
        },
        byType: {
          type: "object",
          description: "Case counts grouped by type",
        },
        byStatus: {
          type: "object",
          description: "Case counts grouped by status",
        },
        total: {
          type: "number",
          description: "Total number of cases",
        },
      },
    },
  })
  async getMonthlyAnalytics(@Query("year") year?: number) {
    return this.caseService.getMonthlyAnalytics(year);
  }

  @Post()
  @ApiOperation({ summary: "Report a new emergency case" })
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({
    description: "Case reported successfully",
    type: Case,
  })
  @UseInterceptors(
    FilesInterceptor("images", 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = "./uploads";
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(new Error("Only image files are allowed!"), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
  )
  async create(
    @Body() createCaseDto: CreateCaseDto,
    @UploadedFiles() images: Express.Multer.File[]
  ) {
    const baseUrl = process.env.API_URL || "http://localhost:5000";
    const processedImages = images?.map((img) => ({
      ...img,
      filename: `${baseUrl}/cases/images/${img.filename}`,
    }));
    return this.caseService.create(createCaseDto, processedImages);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all cases based on user role and jurisdiction",
  })
  @ApiResponse({
    status: 200,
    description: "Return all accessible cases",
    type: [Case],
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  findAll(@Request() req) {
    return this.caseService.findAll(req.user.id);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a specific case by ID" })
  @ApiParam({
    name: "id",
    description: "Case ID",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Return the case if accessible",
    type: Case,
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  findOne(@Param("id") id: string, @Request() req) {
    return this.caseService.findOne(id, req.user.id);
  }

  @Patch(":id/assign")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Assign case to a department" })
  @ApiParam({
    name: "id",
    description: "Case ID",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Case assigned successfully",
    type: Case,
  })
  async assignCase(
    @Param("id") id: string,
    @Body() assignCaseDto: AssignCaseDto,
    @Request() req
  ) {
    return this.caseService.assignCase(id, assignCaseDto, req.user.id);
  }

  @Patch(":id/resolve")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark a case as resolved" })
  @ApiParam({
    name: "id",
    description: "Case ID",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Case marked as resolved successfully",
    type: Case,
  })
  async resolveCase(@Param("id") id: string, @Request() req) {
    return this.caseService.resolveCase(id, req.user.id);
  }

  @Get("images/:filename")
  @ApiOperation({ summary: "Get case image" })
  @ApiParam({
    name: "filename",
    description: "Image filename",
    type: "string",
  })
  async getImage(@Param("filename") filename: string, @Res() res: Response) {
    const imagePath = path.join(process.cwd(), "uploads", filename);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Image not found" });
    }
    return res.sendFile(imagePath);
  }
}
