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
      title: data.title,
      description: data.description,
      capacity: data.capacity,
      price_per_weekend: data.price_per_weekend || undefined,
      price_per_day: data.price_per_day || undefined,
      comfort: data.comfort,
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
    ownerData?: any
  ): SpaceOutputDTO {
    return {
      id: space.id!,
      owner_id: space.owner_id!,
      title: space.title,
      description: space.description,
      address: space.address,
      capacity: space.capacity,
      price_per_weekend: space.price_per_weekend,
      price_per_day: space.price_per_day,
      comfort: space.comfort,
      images: space.images,
      status: space.status,
      created_at: space.created_at?.toISOString(),
      updated_at: space.updated_at?.toISOString(),
      average_rating: metricsData?.average_rating ?? undefined,
      reviews_count: metricsData?.reviews_count ?? undefined,
      views_count: metricsData?.views_count ?? undefined,
      contacts_count: metricsData?.contacts_count ?? undefined,
      contact_whatsapp: space.contact_whatsapp || ownerData?.whatsapp,
      contact_phone: space.contact_phone || ownerData?.phone,
      contact_email: space.contact_email || ownerData?.email,
      contact_instagram: space.contact_instagram || ownerData?.instagram_url,
      contact_facebook: space.contact_facebook || ownerData?.facebook_url,
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
      data: spaces.map(space => this.toOutputDTO(space)),
      total: spaces.length,
    };
  }

  static toOutputDTOWithRating(
    spaceWithRating: import("../../core/repositories/ISpaceRepository").SpaceWithRating
  ): SpaceOutputDTO {
    return this.toOutputDTO(
      spaceWithRating.space,
      {
        average_rating: spaceWithRating.average_rating,
        reviews_count: spaceWithRating.reviews_count,
      },
      spaceWithRating.owner
    );
  }

  static toListOutputDTOWithRatings(
    spacesWithRatings: import("../../core/repositories/ISpaceRepository").SpaceWithRating[]
  ): SpaceListOutputDTO {
    return {
      data: spacesWithRatings.map(swr => this.toOutputDTOWithRating(swr)),
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
        })
      ),
      total: spacesWithMetrics.length,
    };
  }
}
