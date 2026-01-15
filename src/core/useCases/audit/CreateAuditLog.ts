import {
  AuditLogRepositoryPrisma,
  CreateAuditLogDTO,
} from "../../../infra/repositories/sql/AuditLogRepositoryPrisma";

export class CreateAuditLog {
  constructor(private auditLogRepository: AuditLogRepositoryPrisma) {}

  async execute(data: CreateAuditLogDTO): Promise<void> {
    try {
      await this.auditLogRepository.create(data);
    } catch (error) {
      console.error("Error creating audit log:", error);
      // We generally don't want to fail the main user action if logging fails,
      // but strictly for high-security environments we might.
      // For now, we log the error and proceed.
    }
  }
}
