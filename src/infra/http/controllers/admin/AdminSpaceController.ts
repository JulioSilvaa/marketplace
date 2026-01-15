import { Request, Response } from "express";

import { SpaceAdapter } from "../../../adapters/SpaceAdapter";
import { AdminSpaceRepository } from "../../../repositories/sql/admin/AdminSpaceRepository";
import { StripeService } from "../../../services/StripeService";

const adminSpaceRepository = new AdminSpaceRepository();

export default class AdminSpaceController {
  static async list(req: Request, res: Response) {
    const stripeService = new StripeService();
    try {
      const { page = 1, limit = 10, search, status, ownerId } = req.query;
      const result = await adminSpaceRepository.list(
        Number(page),
        Number(limit),
        search as string,
        status as string,
        ownerId as string
      );

      // Map results and fetch coupon names if needed
      const dataWithCoupons = await Promise.all(
        result.data.map(async item => {
          let couponName = undefined;

          if (item.subscription?.coupon_code) {
            // Only fetch if it looks like a coupon/promo code
            couponName =
              (await stripeService.getCouponNameByCode(item.subscription.coupon_code)) || undefined;
          }

          const subscriptionData = item.subscription
            ? {
                ...item.subscription,
                coupon_name: couponName,
              }
            : undefined;

          return SpaceAdapter.toOutputDTO(
            item.space,
            undefined,
            item.owner,
            false,
            subscriptionData
          );
        })
      );

      const response = {
        data: dataWithCoupons,
        total: result.total,
      };
      return res.json(response);
    } catch (error) {
      console.error("Error in AdminSpaceController.list:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await adminSpaceRepository.updateStatus(id, status);
      return res.status(204).send();
    } catch (error) {
      console.error("Error in AdminSpaceController.updateStatus:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
