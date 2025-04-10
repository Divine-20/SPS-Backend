import { Controller, Post, Body, UnauthorizedException } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({
    summary: "User login",
    description: "Authenticate a user and receive a JWT token",
  })
  @ApiCreatedResponse({
    description: "Login successful",
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          example: "success",
          description: "Status of the operation",
        },
        access_token: {
          type: "string",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          description: "JWT access token",
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid credentials",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: 401,
        },
        message: {
          type: "string",
          example: "Invalid credentials",
        },
        error: {
          type: "string",
          example: "Unauthorized",
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = await this.authService.login(user);

    return {
      status: "success",
      access_token: token,
      user: {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        geoLocationId: user.geoLocationId,
      },
    };
  }
}
