import { beforeEach, describe, expect, it } from "vitest";

import { SubscriptionEntity } from "../../../core/entities/SubscriptionEntity";
import { SubscriptionRepositoryInMemory } from "../../../infra/repositories/inMemory/SubscriptionRepositoryInMemory";
import { SubscriptionStatus } from "../../../types/Subscription";

describe("SubscriptionRepositoryInMemory", () => {
  let repository: SubscriptionRepositoryInMemory;

  const createMockSubscription = (
    id: string,
    user_id: string = "user-1",
    plan: string = "Básico",
    price: number = 30
  ): SubscriptionEntity => {
    return SubscriptionEntity.create({
      id,
      user_id,
      plan,
      price,
      status: SubscriptionStatus.ACTIVE,
    });
  };

  beforeEach(() => {
    repository = new SubscriptionRepositoryInMemory();
  });

  describe("create", () => {
    it("Deveria criar e retornar uma assinatura", async () => {
      const subscription = createMockSubscription("sub-1");

      const result = await repository.create(subscription);

      expect(result).toBe(subscription);
      expect(repository.subscriptions).toHaveLength(1);
      expect(repository.subscriptions[0]).toBe(subscription);
    });

    it("Deveria adicionar múltiplas assinaturas", async () => {
      const sub1 = createMockSubscription("sub-1", "user-1");
      const sub2 = createMockSubscription("sub-2", "user-2");

      await repository.create(sub1);
      await repository.create(sub2);

      expect(repository.subscriptions).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("Deveria encontrar uma assinatura por id", async () => {
      const subscription = createMockSubscription("sub-1");
      await repository.create(subscription);

      const result = await repository.findById("sub-1");

      expect(result).toBe(subscription);
    });

    it("Deveria retornar null quando a assinatura não for encontrada", async () => {
      const result = await repository.findById("id-inexistente");

      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("Deveria encontrar uma assinatura por id do usuário", async () => {
      const subscription = createMockSubscription("sub-1", "user-123");
      await repository.create(subscription);

      const result = await repository.findByUserId("user-123");

      expect(result).toBe(subscription);
    });

    it("Deveria retornar null quando o usuário não tiver assinatura", async () => {
      const result = await repository.findByUserId("user-inexistente");

      expect(result).toBeNull();
    });

    it("Deveria retornar a primeira assinatura se o usuário tiver múltiplas", async () => {
      const sub1 = createMockSubscription("sub-1", "user-1");
      const sub2 = createMockSubscription("sub-2", "user-1");

      await repository.create(sub1);
      await repository.create(sub2);

      const result = await repository.findByUserId("user-1");

      expect(result).toBe(sub1);
    });
  });

  describe("findAll", () => {
    it("Deveria retornar todas as assinaturas", async () => {
      const sub1 = createMockSubscription("sub-1", "user-1");
      const sub2 = createMockSubscription("sub-2", "user-2");

      await repository.create(sub1);
      await repository.create(sub2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result).toContain(sub1);
      expect(result).toContain(sub2);
    });

    it("Deveria retornar array vazio quando não existirem assinaturas", async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("Deveria atualizar uma assinatura existente", async () => {
      const subscription = createMockSubscription("sub-1", "user-1", "Básico", 30);
      await repository.create(subscription);

      subscription.changePlan("Premium", 100);

      await repository.update(subscription);

      const result = await repository.findById("sub-1");
      expect(result).toBe(subscription);
      expect(result?.plan).toBe("Premium");
      expect(result?.price).toBe(100);
    });

    it("Não deveria fazer nada ao atualizar uma assinatura inexistente", async () => {
      const subscription = createMockSubscription("id-inexistente");

      await repository.update(subscription);

      expect(repository.subscriptions).toHaveLength(0);
    });
  });

  describe("delete", () => {
    it("Deveria deletar uma assinatura existente", async () => {
      const subscription = createMockSubscription("sub-1");
      await repository.create(subscription);

      expect(repository.subscriptions).toHaveLength(1);

      await repository.delete("sub-1");

      expect(repository.subscriptions).toHaveLength(0);
      const result = await repository.findById("sub-1");
      expect(result).toBeNull();
    });

    it("Não deveria fazer nada ao deletar uma assinatura inexistente", async () => {
      const subscription = createMockSubscription("sub-1");
      await repository.create(subscription);

      expect(repository.subscriptions).toHaveLength(1);

      // Isso deve cobrir o caso de borda onde o id não é encontrado
      await repository.delete("id-inexistente");

      // A assinatura ainda deve existir
      expect(repository.subscriptions).toHaveLength(1);
      const result = await repository.findById("sub-1");
      expect(result).toBe(subscription);
    });

    it("Deveria deletar apenas a assinatura especificada", async () => {
      const sub1 = createMockSubscription("sub-1");
      const sub2 = createMockSubscription("sub-2");
      await repository.create(sub1);
      await repository.create(sub2);

      await repository.delete("sub-1");

      expect(repository.subscriptions).toHaveLength(1);
      expect(repository.subscriptions[0]).toBe(sub2);
    });
  });
});
