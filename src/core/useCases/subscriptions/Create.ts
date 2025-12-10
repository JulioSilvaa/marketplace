import crypto from "crypto";

import { SubscriptionStatus } from "../../../types/Subscription";
import { CreateSubscriptionDTO } from "../../dtos/CreateSubscriptionDTO";
import { SubscriptionEntity } from "../../entities/SubscriptionEntity";
import { ISubscriptionRepository } from "../../repositories/ISubscriptionRepository";
import { IUserRepository } from "../../repositories/userRepository";

export class CreateSubscription {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: CreateSubscriptionDTO): Promise<SubscriptionEntity> {
    // 1. Validar se usuário existe
    const user = await this.userRepository.findById(input.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    // 2. Verificar se já existe assinatura para este usuário (opcional para MVP, mas bom ter)
    const existingSub = await this.subscriptionRepository.findByUserId(input.user_id);
    if (existingSub) {
      throw new Error("User already has a subscription");
    }

    // 3. Criar entidade
    // Garantir que price e status tenham valores ou deixar a entidade lidar se a interface permitir undefined
    // A interface ISubscription define price: number e status: SubscriptionStatus como obrigatórios?
    // Vamos checar ISubscription ja ja. Por segurança, passamos defaults ou deixamos o DTO alinhar.
    // O DTO tem opcionais. A Entidade construi com defaults se vier undefined?
    // O construtor da entidade aceita ISubscription.

    const subscription = SubscriptionEntity.create({
      user_id: input.user_id,
      plan: input.plan,
      price: input.price ?? 30.0,
      status: input.status ?? SubscriptionStatus.TRIAL,
      id: crypto.randomUUID(),
    });

    // 4. Salvar
    await this.subscriptionRepository.create(subscription);

    return subscription;
  }
}
