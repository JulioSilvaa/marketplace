import crypto from "crypto";

import { CreateSpaceDTO } from "../../dtos/CreateSpaceDTO";
import { SpaceEntity } from "../../entities/SpaceEntity";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";
import { IUserRepository } from "../../repositories/IUserRepository";

export class CreateSpace {
  constructor(
    private spaceRepository: ISpaceRepository,
    private userRepository: IUserRepository
  ) {
    this.spaceRepository = spaceRepository;
    this.userRepository = userRepository;
  }

  async execute(input: CreateSpaceDTO): Promise<SpaceEntity> {
    const owner = await this.userRepository.findById(input.owner_id);
    if (!owner) {
      throw new Error("Owner not found");
    }

    // TODO: Implementar validação de subscription quando integrar Mercado Pago
    // A validação deve verificar se o usuário tem uma subscription ativa antes de criar espaço
    // Referência: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/landing

    const space = SpaceEntity.create({
      ...input,
      id: crypto.randomUUID(),
      status: "inactive",
    });

    await this.spaceRepository.create(space);

    return space;
  }
}
