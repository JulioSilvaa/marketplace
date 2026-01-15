import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "../../../lib/prisma";
import AdminDashboardController from "../../../infra/http/controllers/admin/AdminDashboardController";
import { Request, Response } from "express";

describe("AdminDashboardController - MMR & Churn (Integration)", () => {
  beforeAll(async () => {
    // Clean up
    await prisma.subscriptions.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.spaces.deleteMany({});
  });

  afterAll(async () => {
    await prisma.subscriptions.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.spaces.deleteMany({});
    await prisma.$disconnect();
  });

  it("should calculate MMR, New MMR, and Churn correctly", async () => {
    const now = new Date();
    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    // 1. Create Users
    const userOld = await prisma.users.create({
      data: {
        id: "user-old",
        name: "Old User",
        email: "old@test.com",
        phone: "11999999999",
        password: "hash",
        created_at: fortyDaysAgo,
      },
    });

    const userNew = await prisma.users.create({
      data: {
        id: "user-new",
        name: "New User",
        email: "new@test.com",
        phone: "11999999999",
        password: "hash",
        created_at: tenDaysAgo,
      },
    });

    const userChurned = await prisma.users.create({
      data: {
        id: "user-churned",
        name: "Churned User",
        email: "churned@test.com",
        phone: "11999999999",
        password: "hash",
        created_at: fortyDaysAgo,
      },
    });

    // 2. Create Subscriptions

    // Old Active Subscription (Should count to Total MMR, but NOT New MMR)
    // Price: 50.00
    await prisma.subscriptions.create({
      data: {
        id: "sub-old",
        user_id: userOld.id,
        plan: "Pro",
        price: 50.0,
        status: "active",
        created_at: fortyDaysAgo,
        updated_at: fortyDaysAgo,
      },
    });

    // New Active Subscription (Should count to Total MMR AND New MMR)
    // Price: 100.00
    await prisma.subscriptions.create({
      data: {
        id: "sub-new",
        user_id: userNew.id,
        plan: "Enterprise",
        price: 100.0,
        status: "active",
        created_at: tenDaysAgo,
        updated_at: tenDaysAgo,
      },
    });

    // Churned Subscription (Should count to Churned MMR, NOT Total MMR)
    // Cancelled recently (10 days ago)
    // Price: 50.00
    await prisma.subscriptions.create({
      data: {
        id: "sub-churned",
        user_id: userChurned.id,
        plan: "Pro",
        price: 50.0,
        status: "cancelled", // Assuming 'cancelled' is the status string stored
        created_at: fortyDaysAgo,
        updated_at: tenDaysAgo, // Cancelled 10 days ago (within 30 days)
      },
    });

    // Old Churned - Cancelled 40 days ago (Should NOT count to Churned MMR of this month)
    // To test filter logic
    const userOldChurn = await prisma.users.create({
      data: {
        id: "u-old-c",
        name: "Old C",
        email: "oldc@test.com",
        phone: "11999999999",
        password: "123",
        created_at: fortyDaysAgo,
      },
    });
    await prisma.subscriptions.create({
      data: {
        id: "sub-old-churned",
        user_id: userOldChurn.id,
        plan: "Pro",
        price: 50.0,
        status: "cancelled",
        created_at: fortyDaysAgo,
        updated_at: fortyDaysAgo, // Cancelled 40 days ago
      },
    });

    // 3. Mock Request/Response
    const req = {} as Request;
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;

    // 4. Call Controller
    await AdminDashboardController.getStats(req, res);

    // 5. Verify Results
    expect(res.json).toHaveBeenCalled();
    const payload = (res.json as any).mock.calls[0][0];

    // Expected Calculations:
    // Total MMR: sub-old (50) + sub-new (100) = 150
    const expectedMMR = 150;

    // New MMR: sub-new (100)
    const expectedNewMMR = 100;

    // Churned MMR: sub-churned (50). (sub-old-churned is ignored)
    const expectedChurnedMMR = 50;

    // Churn Rate (Customer):
    // Start Customers = (Active End: 2 + Cancelled: 1) - New: 1 = 2
    // Churned: 1
    // Rate: 1 / 2 = 50%
    const expectedChurnRate = 50.0;

    // Revenue Churn Rate:
    // Start MMR = (Active End: 150 + Churned: 50) - New: 100 = 100
    // Churned MMR: 50
    // Rate: 50 / 100 = 50%
    const expectedRevChurnRate = 50.0;

    // console.log("Payload:", payload);

    expect(payload.mmr).toBe(expectedMMR);
    expect(payload.newMmr).toBe(expectedNewMMR);
    expect(payload.churnedMmr).toBe(expectedChurnedMMR);
    expect(payload.churnRate).toBe(expectedChurnRate);
    expect(payload.revenueChurnRate).toBe(expectedRevChurnRate);
  });
});
