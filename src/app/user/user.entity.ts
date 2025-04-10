import { Role } from '@prisma/client';

export class User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: Role;
  geoLocationId: string;
  createdAt: Date;
  updatedAt: Date;
}