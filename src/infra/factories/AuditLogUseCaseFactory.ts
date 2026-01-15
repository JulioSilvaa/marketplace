import { CreateAuditLog } from "../../core/useCases/audit/CreateAuditLog";
import { AuditLogRepositoryPrisma } from "../repositories/sql/AuditLogRepositoryPrisma";

export class AuditLogUseCaseFactory {
  static makeCreateAuditLog(): CreateAuditLog {
    const auditLogRepository = new AuditLogRepositoryPrisma();
    return new CreateAuditLog(auditLogRepository);
  }
}
