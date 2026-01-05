import { describe, expect, it } from "vitest";

import { SpaceEntity } from "../../core/entities/SpaceEntity";
import { SpaceAdapter } from "../../infra/adapters/SpaceAdapter";

describe("SpaceAdapter", () => {
  describe("toOutputDTO", () => {
    it("should convert SpaceEntity to SpaceOutputDTO", () => {
      const space = SpaceEntity.create({
        id: "space-1",
        owner_id: "user-1",
        title: "Beautiful Space",
        description: "A very nice place to stay for your vacation",
        address: {
          street: "Main St",
          number: "123",
          neighborhood: "Downtown",
          city: "City",
          state: "ST",
          country: "Country",
          zipcode: "12345-678",
        },
        capacity: 50,
        price_per_weekend: 200,
        price_per_day: 100,
        comfort: ["Wifi", "Pool"],
        images: ["http://example.com/image.jpg"],
        status: "active",
      });

      const output = SpaceAdapter.toOutputDTO(space);

      expect(output).toEqual({
        id: "space-1",
        owner_id: "user-1",
        owner: undefined,
        title: "Beautiful Space",
        description: "A very nice place to stay for your vacation",
        address: {
          street: "Main St",
          number: "123",
          neighborhood: "Downtown",
          city: "City",
          state: "ST",
          country: "Country",
          zipcode: "12345-678",
        },
        capacity: 50,
        price: 200,
        price_per_weekend: 200,
        price_per_day: 100,
        price_type: "weekend",
        comfort: ["Wifi", "Pool"],
        images: ["http://example.com/image.jpg"],
        status: "active",
        reviews_count: undefined,
        specifications: undefined,
        updated_at: undefined,
        views_count: undefined,
      });
    });
  });

  describe("toListOutputDTO", () => {
    it("should convert array of SpaceEntity to SpaceListOutputDTO", () => {
      const space1 = SpaceEntity.create({
        id: "space-1",
        owner_id: "user-1",
        title: "Space 1",
        description: "A very nice place to stay for your vacation",
        address: {
          street: "Main St",
          number: "123",
          neighborhood: "Downtown",
          city: "City",
          state: "ST",
          country: "Country",
          zipcode: "12345-678",
        },
        capacity: 50,
        price_per_day: 100,
        comfort: ["Wifi"],
        images: ["http://example.com/1.jpg"],
        status: "active",
      });

      const space2 = SpaceEntity.create({
        id: "space-2",
        owner_id: "user-2",
        title: "Space 2",
        description: "Another beautiful place for your vacation",
        address: {
          street: "Second St",
          number: "456",
          neighborhood: "Uptown",
          city: "City",
          state: "ST",
          country: "Country",
          zipcode: "98765-432",
        },
        capacity: 30,
        price_per_day: 80,
        comfort: ["Pool"],
        images: ["http://example.com/2.jpg"],
        status: "active",
      });

      const output = SpaceAdapter.toListOutputDTO([space1, space2]);

      expect(output.total).toBe(2);
      expect(output.data).toHaveLength(2);
      expect(output.data[0].id).toBe("space-1");
      expect(output.data[1].id).toBe("space-2");
    });

    it("should return empty list when no spaces provided", () => {
      const output = SpaceAdapter.toListOutputDTO([]);

      expect(output.total).toBe(0);
      expect(output.data).toHaveLength(0);
    });
  });
});
