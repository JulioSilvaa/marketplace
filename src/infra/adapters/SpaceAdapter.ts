import { spaces } from "../../../generated/prisma/client";
import { SpaceListOutputDTO } from "../../core/dtos/SpaceListOutputDTO";
import { SpaceOutputDTO } from "../../core/dtos/SpaceOutputDTO";
import { SpaceEntity } from "../../core/entities/SpaceEntity";
import { IAddress, spaceStatus } from "../../types/Space";

export class SpaceAdapter {
  static toEntity(data: spaces): SpaceEntity {
    const address: IAddress = {
      street: data.street,
      number: data.number,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zipcode: data.zipcode,
      country: data.country,
    };

    return SpaceEntity.create({
      id: data.id,
      owner_id: data.owner_id,
      category_id: data.category_id || undefined,
      category_name: (data as any).category?.name || undefined,
      title: data.title,
      description: data.description,
      capacity: data.capacity ?? undefined,
      price_per_weekend: data.price_per_weekend || undefined,
      price_per_day: data.price_per_day || undefined,
      comfort: data.comfort,
      specifications: (data.specifications as Record<string, any>) || undefined,
      images: data.images,
      status: data.status as spaceStatus,
      contact_whatsapp: data.contact_whatsapp || undefined,
      contact_phone: data.contact_phone || undefined,
      contact_email: data.contact_email || undefined,
      contact_instagram: data.contact_instagram || undefined,
      contact_facebook: data.contact_facebook || undefined,
      address,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  }

  static toOutputDTO(
    space: SpaceEntity,
    metricsData?: {
      average_rating?: number | null;
      reviews_count?: number;
      views_count?: number;
      contacts_count?: number;
    },
    ownerData?: any,
    simplified: boolean = false
  ): SpaceOutputDTO {
    return {
      id: space.id!,
      owner_id: space.owner_id!,
      category_name: space.category_name,
      title: space.title,
      description: space.description,
      address: space.address,
      capacity: space.capacity,
      price_per_weekend: space.price_per_weekend,
      price_per_day: space.price_per_day,
      price: space.price_per_weekend || space.price_per_day || 0,
      price_type: space.price_per_weekend ? "weekend" : "daily",
      comfort: space.comfort,
      specifications: space.specifications,
      images: simplified && space.images.length > 0 ? [space.images[0]] : space.images,
      status: space.status,
      created_at: space.created_at?.toISOString(),
      updated_at: space.updated_at?.toISOString(),
      average_rating: metricsData?.average_rating ?? undefined,
      reviews_count: metricsData?.reviews_count ?? undefined,
      views_count: metricsData?.views_count ?? undefined,
      contacts_count: metricsData?.contacts_count ?? undefined,
      contact_whatsapp: space.contact_whatsapp,
      contact_phone: space.contact_phone,
      contact_email: space.contact_email,
      contact_instagram: space.contact_instagram,
      contact_facebook: space.contact_facebook,
      owner: ownerData
        ? {
          name: ownerData.name,
          phone: ownerData.phone,
          whatsapp: ownerData.whatsapp,
          facebook_url: ownerData.facebook_url,
          instagram_url: ownerData.instagram_url,
          email: ownerData.email,
        }
        : undefined,
    };
  }

  static toListOutputDTO(spaces: SpaceEntity[]): SpaceListOutputDTO {
    return {
      data: spaces.map(space => this.toOutputDTO(space, undefined, undefined, true)),
      total: spaces.length,
    };
  }

  static toOutputDTOWithRating(
    spaceWithRating: import("../../core/repositories/ISpaceRepository").SpaceWithRating,
    simplified: boolean = false
  ): SpaceOutputDTO {
    return this.toOutputDTO(
      spaceWithRating.space,
      {
        average_rating: spaceWithRating.average_rating,
        reviews_count: spaceWithRating.reviews_count,
      },
      spaceWithRating.owner,
      simplified
    );
  }

  static toListOutputDTOWithRatings(
    spacesWithRatings: import("../../core/repositories/ISpaceRepository").SpaceWithRating[]
  ): SpaceListOutputDTO {
    return {
      data: spacesWithRatings.map(swr => this.toOutputDTOWithRating(swr, true)),
      total: spacesWithRatings.length,
    };
  }

  static toListOutputDTOWithMetrics(
    spacesWithMetrics: import("../../core/repositories/ISpaceRepository").SpaceWithMetrics[]
  ): SpaceListOutputDTO {
    return {
      data: spacesWithMetrics.map(swm =>
        this.toOutputDTO(swm.space, {
          average_rating: swm.average_rating,
          reviews_count: swm.reviews_count,
          views_count: swm.views_count,
          contacts_count: swm.contacts_count,
        }, undefined, true)
      ),
      total: spacesWithMetrics.length,
    };
  }
}
