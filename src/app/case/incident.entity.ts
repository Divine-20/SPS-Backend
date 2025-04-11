import { IncidentStatus } from "@prisma/client";

export class IncidentImage {
  id: string;
  url: string;
  caseId: string;
  createdAt: Date;
}

export class Incident {
  id: string;
  startingTime: Date;
  actionTaken?: string;
  description: string;
  status: IncidentStatus;
  departmentId: string;
  userId: string;
  geoLocationId: string;
  images: IncidentImage[];
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;
}
