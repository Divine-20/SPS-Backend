import { Controller, Get, Patch, Param, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/user.decorator";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: "Get all unread notifications for the authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "Returns all unread notifications for the user",
    type: Array,
  })
  getUnreadNotifications(@CurrentUser() user: { id: string }) {
    return this.notificationService.getUnreadNotifications(user.id);
  }
  @Get("all")
  @ApiOperation({
    summary: "Get all  notifications for the authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "Returns all  notifications for the user",
    type: Array,
  })
  getAllNotifications(@CurrentUser() user: { id: string }) {
    return this.notificationService.getAllNotifications(user.id);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiResponse({
    status: 200,
    description: "Notification marked as read successfully",
  })
  markAsRead(@Param("id") id: string, @CurrentUser() user: { id: string }) {
    return this.notificationService.markAsRead(id, user.id);
  }
}
