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
  HttpException,
  HttpStatus,
  NotFoundException,
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
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { diskStorage } from "multer";
import { extname } from "path";
import { Response } from "express";
import * as path from "path";
import * as fs from "fs";
import { IncidentService } from "./incident.service";
import { Incident } from "./incident.entity";
import { CreateIncidentDto } from "./dto/create-incident.dto";

@ApiTags("incidents")
@Controller("api/v1/incidents")
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  @ApiOperation({ summary: "Report a new incident" })
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({
    description: "Incident reported successfully",
    type: Incident,
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
    @Body() createIncidentDto: CreateIncidentDto,
    @UploadedFiles() images: Express.Multer.File[]
  ) {
    const baseUrl = process.env.API_URL || "http://localhost:8080";
    const processedImages = images?.map((img) => ({
      ...img,
      filename: `${baseUrl}/incidents/images/${img.filename}`,
    }));
    return this.incidentService.create(createIncidentDto, processedImages);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all incidents",
  })
  @ApiResponse({
    status: 200,
    description: "Return all accessible incidents",
    type: [Incident],
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  findAll() {
    return this.incidentService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a specific incident by ID" })
  @ApiParam({
    name: "id",
    description: "Incident ID",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Return the incident if accessible",
    type: Incident,
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  findOne(@Param("id") id: string) {
    return this.incidentService.findOne(id);
  }

  @Get("user/:userId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get incidents by user ID" })
  @ApiParam({
    name: "userId",
    description: "User ID",
    type: "string",
  })
  findByUser(@Param("userId") userId: string) {
    return this.incidentService.findByUser(userId);
  }

  @Get("service/:serviceId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get incidents by service ID" })
  @ApiParam({
    name: "serviceId",
    description: "Service ID",
    type: "string",
  })
  findByService(@Param("serviceId") serviceId: string) {
    return this.incidentService.findByService(serviceId);
  }

  @Get("department/:departmentId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get incidents by department ID" })
  @ApiParam({
    name: "departmentId",
    description: "Department ID",
    type: "string",
  })
  findByDepartment(@Param("departmentId") departmentId: string) {
    return this.incidentService.findByDepartment(departmentId);
  }

  @Patch(":id/assign-department")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Assign incident to a department" })
  @ApiParam({
    name: "id",
    description: "Incident ID",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Incident assigned successfully",
    type: Incident,
  })
  async assignDepartment(
    @Param("id") id: string,
    @Body("departmentId") departmentId: string,
    @Request() req
  ) {
    try {
      return await this.incidentService.assignDepartment(
        id,
        departmentId,
        req.user.id
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("images/:filename")
  @ApiOperation({ summary: "Get incident image" })
  @ApiParam({
    name: "filename",
    description: "Image filename",
    type: "string",
  })
  async getImage(@Param("filename") filename: string, @Res() res: Response) {
    const imagePath = path.join(process.cwd(), "uploads", filename);
    if (!fs.existsSync(imagePath)) {
      throw new HttpException("Image not found", HttpStatus.NOT_FOUND);
    }
    return res.sendFile(imagePath);
  }
}
