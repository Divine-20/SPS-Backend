import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ServiceService } from "./service.service";
import { Controller, Get } from "@nestjs/common";

@ApiTags("services")
@Controller("api/v1/services")
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @ApiOperation({
    summary: "Get all services with their complete hierarchy",
  })
  @ApiResponse({
    status: 200,
    description: "Returns all services with their complete hierarchy tree",
  })
  findAll() {
    return this.serviceService.findAll();
  }
}
