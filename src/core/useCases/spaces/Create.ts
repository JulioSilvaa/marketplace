import crypto from "crypto";

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
  ) {
    this.spaceRepository = spaceRepository;
    this.userRepository = userRepository;
    this.subscriptionRepository = subscriptionRepository;
  }

  async execute(input: CreateSpaceDTO): Promise<SpaceEntity> {
    const owner = await this.userRepository.findById(input.owner_id);
    if (!owner) {
      throw new Error("Owner not found");
    }
    const subscription = await this.subscriptionRepository.findByUserId(input.owner_id);
    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error("User needs an active subscription to create a space");
    }

    const space = SpaceEntity.create({
      ...input,
      id: crypto.randomUUID(),
      status: "active",
    });

    await this.spaceRepository.create(space);

    return space;
  }
}
