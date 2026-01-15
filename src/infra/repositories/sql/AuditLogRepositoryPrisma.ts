import { prisma } from "../../../lib/prisma";

export interface CreateAuditLogDTO {
  userId?: string;
  action: string;
  resourceId?: string;
  details?: any;
  ip?: string;
  userAgent?: string;
}

export class AuditLogRepositoryPrisma {
  async create(data: CreateAuditLogDTO): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resourceId: data.resourceId,
        details: data.details,
        ip: data.ip,
        userAgent: data.userAgent,
      },
    });
  }
}
