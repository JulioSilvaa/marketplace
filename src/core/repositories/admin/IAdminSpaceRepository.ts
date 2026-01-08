import { SpaceEntity } from "../../entities/SpaceEntity";

export interface IAdminSpaceRepository {
  list(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<{ data: { space: SpaceEntity; owner: any }[]; total: number }>;
  updateStatus(id: string, status: string): Promise<void>;
  delete(id: string): Promise<void>; // Permanent or soft? Soft usually.
}
