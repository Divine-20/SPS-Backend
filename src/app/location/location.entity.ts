import { ApiProperty } from "@nestjs/swagger";

export class GeoLocation {
  id: string;
  name: string;
  locationType: string;
  parentGeoLocationId?: string;
  subGeoLocations?: GeoLocation[];
}
