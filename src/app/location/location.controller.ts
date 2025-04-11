import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { LocationService } from "./location.service";
import { GeoLocation } from "./location.entity";

@ApiTags("locations")
@Controller("api/v1/locations")
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @ApiOperation({
    summary: "Get all locations with their complete hierarchy",
    description: "Returns a tree structure of all geographical locations",
  })
  @ApiResponse({
    status: 200,
    description: "Returns all locations with their complete hierarchy tree",
    type: [GeoLocation],
  })
  findAll() {
    return this.locationService.findAll();
  }

  @Get("provinces")
  @ApiOperation({
    summary: "Get all provinces",
    description:
      "Returns a list of all provinces with their immediate children",
  })
  @ApiResponse({
    status: 200,
    description: "Returns all provinces with their nested locations",
    type: [GeoLocation],
  })
  findProvinces() {
    return this.locationService.findProvinces();
  }

  @Get(":parentId/children")
  @ApiOperation({
    summary: "Get child locations",
    description:
      "Returns immediate child locations for a given parent location ID",
  })
  @ApiParam({
    name: "parentId",
    description: "Id of the parent location",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Returns immediate child locations for the specified parent",
    type: [GeoLocation],
  })
  @ApiResponse({
    status: 404,
    description: "Parent location not found",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 404 },
        message: { type: "string", example: "Parent location not found" },
        error: { type: "string", example: "Not Found" },
      },
    },
  })
  findByParent(@Param("parentId") parentId: string) {
    return this.locationService.findByParent(parentId);
  }
}
