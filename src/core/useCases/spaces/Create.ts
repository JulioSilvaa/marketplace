import crypto from "crypto";

import { spaceStatus } from "../../../types/Space";
import { SubscriptionStatus } from "../../../types/Subscription";
import { CreateSpaceDTO } from "../../dtos/CreateSpaceDTO";
import { SpaceEntity } from "../../entities/SpaceEntity";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";
import { ISubscriptionRepository } from "../../repositories/ISubscriptionRepository";
import { IUserRepository } from "../../repositories/IUserRepository";

export class CreateSpace {
  constructor(
    private spaceRepository: ISpaceRepository,
    private userRepository: IUserRepository,
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(input: CreateSpaceDTO): Promise<SpaceEntity> {
    // 1. Validar se o usuário (dono) existe
    const owner = await this.userRepository.findById(input.owner_id);
    if (!owner) {
      throw new Error("Owner not found");
    }

    // 2. Validar assinatura (Exemplo: Apenas usuários com assinatura ATIVA podem criar espaços)
    const subscription = await this.subscriptionRepository.findByUserId(input.owner_id);
    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      // Para MVP, assumimos que precisa de assinatura.
      // Em modelos freemium, isso seria mais flexível.
      throw new Error("User needs an active subscription to create a space");
    }

    // 3. Criar a entidade de espaço (validações internas da entidade)
    const space = SpaceEntity.create({
      ...input,
      id: crypto.randomUUID(),
      status: "active",
    });

    // 4. Persistir
    await this.spaceRepository.create(space);

    return space;
  }
}
