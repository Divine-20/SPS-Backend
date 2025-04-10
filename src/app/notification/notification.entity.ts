export class Notification {
  id: string;
  title: string;
  content: string;
  metadata: any;
  isRead: boolean;
  isArchived: boolean;
  caseId: string;
  recipientId: string;
  createdAt: Date;
  updatedAt: Date;
}
