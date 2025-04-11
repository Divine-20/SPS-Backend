import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OperatorService } from "./operator.service";
import { CreateOperatorDto } from "./dto/create-operator.dto";

@ApiTags("operators")
@Controller("api/v1/operators")
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Post()
  @ApiOperation({ summary: "Create a new Operator" })
  @ApiResponse({ status: 201, description: "Operator created successfully" })
  @ApiResponse({ status: 409, description: "Operator already exists" })
  async create(@Body() createOperatorDto: CreateOperatorDto) {
    try {
      return await this.operatorService.createOperator(createOperatorDto);
    } catch (error) {
      if (error.code === "P2002") {
        throw new HttpException("Operator already exists", HttpStatus.CONFLICT);
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all operators" })
  @ApiResponse({ status: 200, description: "Returns all operators" })
  async findAll() {
    return this.operatorService.findAllOperators();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get operator by ID" })
  @ApiResponse({ status: 200, description: "Returns operator details" })
  @ApiResponse({ status: 404, description: "Operator not found" })
  async findOne(@Param("id") id: string) {
    const operator = await this.operatorService.findOperatorById(id);
    if (!operator) {
      throw new HttpException("Operator not found", HttpStatus.NOT_FOUND);
    }
    return operator;
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current operator profile" })
  @ApiResponse({ status: 200, description: "Returns operator profile" })
  @ApiResponse({ status: 404, description: "Profile not found" })
  async getProfile(@Request() req) {
    const operator = await this.operatorService.findOperatorById(req.user.id);
    if (!operator) {
      throw new HttpException("Profile not found", HttpStatus.NOT_FOUND);
    }
    return operator;
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete an operator" })
  @ApiResponse({ status: 200, description: "Operator deleted successfully" })
  @ApiResponse({ status: 404, description: "Operator not found" })
  async remove(@Param("id") id: string) {
    try {
      return await this.operatorService.deleteOperator(id);
    } catch (error) {
      if (error.message === "Operator not found") {
        throw new HttpException("Operator not found", HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
