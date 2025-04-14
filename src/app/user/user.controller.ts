import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("users")
@Controller("api/v1/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 409, description: "User already exists" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({
    status: 200,
    description: "Returns user profile with location details",
  })
  async getProfile(@Request() req) {
    return this.userService.getProfile(req.user.id);
  }

  @Get("user/:ticketNumber")
  @ApiOperation({ summary: "Get user details" })
  @ApiResponse({
    status: 200,
    description: "Returns user details",
  })
  async getUserByTicketNumber(@Param("ticketNumber") ticketNumber: string) {
    return this.userService.findByTicketNumber(ticketNumber);
  }
}
