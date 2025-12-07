import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { SubscriptionEntity } from "../../core/entities/SubscriptionEntity";
import { ISubscription, SubscriptionStatus } from "../../types/Subscription";

const MOCK_DATE_INITIAL = new Date("2025-10-27T10:00:00.000Z");
const MOCK_DATE_UPDATED = new Date("2025-10-27T10:05:00.000Z");
const MOCK_FUTURE_DATE = new Date("2026-01-01T00:00:00.000Z");
const MOCK_PAST_DATE = new Date("2025-01-01T00:00:00.000Z");

const mockValidProps: ISubscription = {
  id: "sub-id-abc",
  user_id: "user-id-xyz",
  plan: "premium",
  price: 99.99,
  status: SubscriptionStatus.ACTIVE,
  trial_until: new Date("2025-11-01"),
  next_billing_date: new Date("2025-11-27"),
  created_at: MOCK_DATE_INITIAL,
  updated_at: MOCK_DATE_INITIAL,
};

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_DATE_INITIAL);
});

afterAll(() => {
  vi.useRealTimers();
});

describe("SubscriptionEntity", () => {
  describe("Criação e Props/Defaults", () => {
    it("deve criar uma instância válida e cobrir todos os getters", () => {
      const sub = SubscriptionEntity.create(mockValidProps);

      expect(sub.id).toBe("sub-id-abc");
      expect(sub.user_id).toBe("user-id-xyz");
      expect(sub.plan).toBe("premium");
      expect(sub.price).toBe(99.99);
      expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
      expect(sub.trial_until).toEqual(new Date("2025-11-01"));
      expect(sub.next_billing_date).toEqual(new Date("2025-11-27"));
      expect(sub.created_at).toEqual(MOCK_DATE_INITIAL);
      expect(sub.updated_at).toEqual(MOCK_DATE_INITIAL);
    });

    it("deve aplicar todos os valores default quando apenas o user_id for fornecido", () => {
      const minimalProps: ISubscription = {
        user_id: "u-def",
        price: 30.0,
        plan: "basic",
      };
      const sub = SubscriptionEntity.create(minimalProps);

      expect(sub.plan).toBe("basic");
      expect(sub.price).toBe(30.0);
      expect(sub.status).toBe(SubscriptionStatus.TRIAL);
      expect(sub.created_at).toEqual(MOCK_DATE_INITIAL);
      expect(sub.updated_at).toEqual(MOCK_DATE_INITIAL);
    });
  });

  describe("Validações", () => {
    it("deve falhar se o user_id for vazio", () => {
      expect(() => SubscriptionEntity.create({ ...mockValidProps, user_id: "" })).toThrow(
        "ID do usuário (user_id) é obrigatório."
      );
    });

    it("deve falhar se o plan for muito curto", () => {
      expect(() => SubscriptionEntity.create({ ...mockValidProps, plan: "ab" })).toThrow(
        "O nome do plano deve ser fornecido e ter pelo menos 3 caracteres."
      );
    });

    it("deve falhar se o price for negativo", () => {
      expect(() => SubscriptionEntity.create({ ...mockValidProps, price: -0.01 })).toThrow(
        "O preço deve ser um valor numérico positivo."
      );
    });

    it("deve falhar se o price for zero", () => {
      expect(() => SubscriptionEntity.create({ ...mockValidProps, price: 0 })).toThrow(
        "O preço deve ser um valor numérico positivo."
      );
    });

    it("deve falhar se o price não for um número", () => {
      expect(() => SubscriptionEntity.create({ ...mockValidProps, price: "x" as any })).toThrow(
        "O preço deve ser um valor numérico positivo."
      );
    });
  });

  describe("Métodos de Domínio (activate, suspend, updateBillingDate)", () => {
    // ACTIVATE
    it("deve ativar de TRIAL para ACTIVE e atualizar a data", () => {
      const sub = SubscriptionEntity.create({
        user_id: "u1",
        status: SubscriptionStatus.TRIAL,
        price: 1,
        plan: "",
      });
      vi.setSystemTime(MOCK_DATE_UPDATED);
      sub.activate();
      expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
      expect(sub.updated_at).toEqual(MOCK_DATE_UPDATED);
    });

    it("deve ativar de SUSPENDED para ACTIVE", () => {
      const sub = SubscriptionEntity.create({
        user_id: "u1",
        status: SubscriptionStatus.SUSPENDED,
        price: 1,
        plan: "",
      });
      vi.setSystemTime(MOCK_DATE_UPDATED);
      sub.activate();
      expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it("deve lançar erro se tentar ativar uma assinatura já ACTIVE", () => {
      const sub = SubscriptionEntity.create({
        user_id: "u1",
        status: SubscriptionStatus.ACTIVE,
        price: 1,
        plan: "",
      });
      expect(() => sub.activate()).toThrow(
        "Não é possível ativar a assinatura no status atual: active"
      );
    });

    it("deve lançar erro se tentar ativar uma assinatura CANCELLED", () => {
      const sub = SubscriptionEntity.create({
        user_id: "u1",
        status: SubscriptionStatus.CANCELLED,
        price: 1,
        plan: "",
      });
      expect(() => sub.activate()).toThrow(
        "Não é possível ativar a assinatura no status atual: cancelled"
      );
    });

    // SUSPEND
    it("deve suspender de ACTIVE para SUSPENDED e atualizar a data", () => {
      const sub = SubscriptionEntity.create({
        user_id: "u1",
        status: SubscriptionStatus.ACTIVE,
        price: 1,
        plan: "",
      });
      vi.setSystemTime(MOCK_DATE_UPDATED);
      sub.suspend();
      expect(sub.status).toBe(SubscriptionStatus.SUSPENDED);
      expect(sub.updated_at).toEqual(MOCK_DATE_UPDATED);
    });

    it("deve lançar erro se tentar suspender uma assinatura em TRIAL", () => {
      const sub = SubscriptionEntity.create({
        user_id: "u1",
        status: SubscriptionStatus.TRIAL,
        price: 1,
        plan: "",
      });
      console.log(sub.status, "status da assinatura");
      expect(() => sub.suspend()).toThrow(
        "Não é possível suspender a assinatura no status atual: trial"
      );
    });

    it("deve lançar erro se tentar suspender uma assinatura CANCELLED", () => {
      const sub = SubscriptionEntity.create({
        user_id: "u1",
        status: SubscriptionStatus.CANCELLED,
        price: 1,
        plan: "",
      });
      expect(() => sub.suspend()).toThrow(
        "Não é possível suspender a assinatura no status atual: cancelled"
      );
    });

    // UPDATE BILLING DATE
    it("deve atualizar a data de cobrança e o updated_at para uma data futura", () => {
      const sub = SubscriptionEntity.create({
        user_id: "u1",
        price: 1,
        plan: "",
      });
      vi.setSystemTime(MOCK_DATE_UPDATED);
      sub.updateBillingDate(MOCK_FUTURE_DATE);
      expect(sub.next_billing_date).toEqual(MOCK_FUTURE_DATE);
      expect(sub.updated_at).toEqual(MOCK_DATE_UPDATED);
    });

    it("deve lançar erro se a nova data de cobrança for no passado", () => {
      const sub = SubscriptionEntity.create({
        user_id: "u1",
        price: 1,
        plan: "",
      });
      expect(() => sub.updateBillingDate(MOCK_PAST_DATE)).toThrow(
        "A próxima data de cobrança deve ser uma data futura à data atual."
      );
    });

    it("deve lançar erro se a nova data de cobrança for igual ao momento atual", () => {
      const sub = SubscriptionEntity.create({
        user_id: "u1",
        price: 1,
        plan: "",
      });
      expect(() => sub.updateBillingDate(MOCK_DATE_INITIAL)).toThrow(
        "A próxima data de cobrança deve ser uma data futura à data atual."
      );
    });
  });
});
