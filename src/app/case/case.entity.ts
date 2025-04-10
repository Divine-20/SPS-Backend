import { CaseType, CaseStatus, Department } from "@prisma/client";

export class CaseImage {
  id: string;
  url: string;
  caseId: string;
  createdAt: Date;
}

export class Case {
  id: string;
  caseType: CaseType;
  cause: string;
  startingTime: Date;
  actionTaken?: string;
  description: string;
  status: CaseStatus;
  assignedDepartment?: Department;
  reporterId: string;
  geoLocationId: string;
  images: CaseImage[];
  createdAt: Date;
  updatedAt: Date;
}
