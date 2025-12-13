import { describe, expect, it } from "vitest";

import { SubscriptionEntity } from "../../core/entities/SubscriptionEntity";
import { SubscriptionAdapter } from "../../infra/adapters/SubscriptionAdapter";
import { SubscriptionStatus } from "../../types/Subscription";

describe("SubscriptionAdapter", () => {
  describe("toOutputDTO", () => {
    it("should convert SubscriptionEntity to SubscriptionOutputDTO with ISO dates", () => {
      const trialDate = new Date("2025-01-15");
      const billingDate = new Date("2025-02-01");

      const subscription = SubscriptionEntity.create({
        id: "sub-1",
        user_id: "user-1",
        plan: "premium",
        price: 50,
        status: SubscriptionStatus.ACTIVE,
        trial_until: trialDate,
        next_billing_date: billingDate,
      });

      const output = SubscriptionAdapter.toOutputDTO(subscription);

      expect(output.id).toBe("sub-1");
      expect(output.user_id).toBe("user-1");
      expect(output.plan).toBe("premium");
      expect(output.price).toBe(50);
      expect(output.status).toBe(SubscriptionStatus.ACTIVE);
      expect(output.trial_until).toBe(trialDate.toISOString());
      expect(output.next_billing_date).toBe(billingDate.toISOString());
      expect(output.created_at).toBeDefined();
      expect(output.updated_at).toBeDefined();
    });

    it("should handle undefined dates", () => {
      const subscription = SubscriptionEntity.create({
        id: "sub-1",
        user_id: "user-1",
        plan: "basic",
        price: 30,
        status: SubscriptionStatus.TRIAL,
      });

      const output = SubscriptionAdapter.toOutputDTO(subscription);

      expect(output.trial_until).toBeUndefined();
      expect(output.next_billing_date).toBeUndefined();
    });
  });

  describe("toListOutputDTO", () => {
    it("should convert array of SubscriptionEntity to SubscriptionListOutputDTO", () => {
      const sub1 = SubscriptionEntity.create({
        id: "sub-1",
        user_id: "user-1",
        plan: "basic",
        price: 30,
        status: SubscriptionStatus.ACTIVE,
      });

      const sub2 = SubscriptionEntity.create({
        id: "sub-2",
        user_id: "user-2",
        plan: "premium",
        price: 50,
        status: SubscriptionStatus.TRIAL,
      });

      const output = SubscriptionAdapter.toListOutputDTO([sub1, sub2]);

      expect(output.total).toBe(2);
      expect(output.data).toHaveLength(2);
      expect(output.data[0].id).toBe("sub-1");
      expect(output.data[1].id).toBe("sub-2");
    });
  });
});
