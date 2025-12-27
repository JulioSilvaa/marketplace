/* eslint-disable no-undef */
import { Request, Response } from "express";

import { SpaceAdapter } from "../../adapters/SpaceAdapter";
import { SpaceUseCaseFactory } from "../../factories/SpaceUseCaseFactory";

class SpaceController {
  async add(req: Request, res: Response) {
    try {
      // user_id vem do token JWT (AuthMiddleware)
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Processar imagens se houver
      const imageUrls: string[] = [];

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        // Validar limite de 10 imagens por espaço
        if (req.files.length > 10) {
          return res.status(400).json({
            message: "Máximo de 10 imagens por espaço",
          });
        }

        const { SharpImageService } = await import("../../services/SharpImageService");
        const { SupabaseStorageService } = await import("../../services/SupabaseStorageService");

        const imageService = new SharpImageService();
        const storageService = new SupabaseStorageService();
        const BUCKET_NAME = "space-images";

        // Sanitizar título do espaço para usar como nome da pasta
        const sanitizedTitle = req.body.title
          ? req.body.title.replace(/[^a-zA-Z0-9-_]/g, "_").toLowerCase()
          : `space_${Date.now()}`;

        for (const file of req.files as Express.Multer.File[]) {
          // Validar e processar imagem
          await imageService.validateImage(file.buffer, file.mimetype);
          const processed = await imageService.processImage(file.buffer, file.originalname);

          // Gerar nome único
          const timestamp = Date.now();
          const baseName = file.originalname.replace(/\.[^/.]+$/, "");
          const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
          const uniqueName = `${timestamp}_${sanitizedName}`;

          // Estrutura de pastas: spaces/{owner_id}/{space_title}/
          const basePath = `spaces/${owner_id}/${sanitizedTitle}`;

          // Upload dos 3 tamanhos
          const [thumbnailUrl, mediumUrl, largeUrl] = await Promise.all([
            storageService.uploadImage(
              BUCKET_NAME,
              `${basePath}/thumb_${uniqueName}.webp`,
              processed.thumbnail,
              "image/webp"
            ),
            storageService.uploadImage(
              BUCKET_NAME,
              `${basePath}/medium_${uniqueName}.webp`,
              processed.medium,
              "image/webp"
            ),
            storageService.uploadImage(
              BUCKET_NAME,
              `${basePath}/large_${uniqueName}.webp`,
              processed.large,
              "image/webp"
            ),
          ]);

          // Salvar objeto com os 3 tamanhos
          imageUrls.push(
            JSON.stringify({
              thumbnail: thumbnailUrl,
              medium: mediumUrl,
              large: largeUrl,
            })
          );
        }
      }

      // Parsear dados do formulário
      let spaceData = req.body;

      // Se vier como string (multipart/form-data), fazer parse
      if (typeof spaceData.address === "string") {
        spaceData.address = JSON.parse(spaceData.address);
      }
      if (typeof spaceData.comfort === "string") {
        spaceData.comfort = JSON.parse(spaceData.comfort);
      }
      if (typeof spaceData.price_per_day === "string") {
        spaceData.price_per_day = parseFloat(spaceData.price_per_day);
      }
      if (typeof spaceData.price_per_weekend === "string") {
        spaceData.price_per_weekend = parseFloat(spaceData.price_per_weekend);
      }
      if (typeof spaceData.capacity === "string") {
        spaceData.capacity = parseInt(spaceData.capacity);
      }

      const createSpace = SpaceUseCaseFactory.makeCreateSpace();
      const space = await createSpace.execute({
        ...spaceData,
        owner_id,
        images: imageUrls.length > 0 ? imageUrls : spaceData.images || [],
      });

      const output = SpaceAdapter.toOutputDTO(space);

      return res.status(201).json({
        message: "Espaço criado com sucesso",
        data: output,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao criar espaço" });
    }
  }

  async getSpaces(req: Request, res: Response) {
    try {
      const { owner_id } = req.query;

      // Se owner_id for fornecido, filtra por proprietário (com métricas)
      if (owner_id && typeof owner_id === "string") {
        const listSpaces = SpaceUseCaseFactory.makeListSpaces();
        const spacesWithMetrics = await listSpaces.executeByOwnerWithMetrics({ owner_id });
        const output = SpaceAdapter.toListOutputDTOWithMetrics(spacesWithMetrics);
        return res.status(200).json({
          spaces: output.data,
          pagination: {
            total: output.total,
            page: 1,
            limit: 100,
            totalPages: Math.ceil(output.total / 100) || 1,
          },
        });
      }

      // Caso contrário, lista todos os espaços COM ratings
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const city = req.query.city as string;
      const state = req.query.state as string;
      const category_id =
        req.query.category_id && !isNaN(parseInt(req.query.category_id as string))
          ? parseInt(req.query.category_id as string)
          : undefined;
      const price_min =
        req.query.price_min && !isNaN(parseFloat(req.query.price_min as string))
          ? parseFloat(req.query.price_min as string)
          : undefined;
      const price_max =
        req.query.price_max && !isNaN(parseFloat(req.query.price_max as string))
          ? parseFloat(req.query.price_max as string)
          : undefined;
      const search = req.query.search as string;
      const neighborhood = req.query.neighborhood as string;

      const findAllSpaces = SpaceUseCaseFactory.makeFindAllSpaces();
      const spacesWithRatings = await findAllSpaces.executeWithRatings({
        limit,
        city,
        state,
        category_id,
        price_min,
        price_max,
        search,
        neighborhood,
      });
      const output = SpaceAdapter.toListOutputDTOWithRatings(spacesWithRatings);
      return res.status(200).json({
        spaces: output.data,
        pagination: {
          total: output.total,
          page: 1,
          limit: limit,
          totalPages: Math.ceil(output.total / limit) || 1,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao listar espaços" });
    }
  }

  async getAllSpaces(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const findAllSpaces = SpaceUseCaseFactory.makeFindAllSpaces();
      const spacesWithRatings = await findAllSpaces.executeWithRatings({ limit });

      const output = SpaceAdapter.toListOutputDTOWithRatings(spacesWithRatings);

      return res.status(200).json({
        spaces: output.data,
        pagination: {
          total: output.total,
          page: 1,
          limit: limit,
          totalPages: Math.ceil(output.total / limit) || 1,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao listar espaços" });
    }
  }

  async checkOwnership(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(200).json({ isOwner: false });
      }

      const findByIdSpace = SpaceUseCaseFactory.makeFindByIdSpace();
      const space = await findByIdSpace.execute(id);

      if (!space) {
        return res.status(404).json({ message: "Espaço não encontrado" });
      }

      return res.status(200).json({ isOwner: space.owner_id === owner_id });
    } catch (error) {
      return res.status(200).json({ isOwner: false });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const findByIdSpace = SpaceUseCaseFactory.makeFindByIdSpace();
      const spaceWithRating = await findByIdSpace.executeWithRating(id);

      if (!spaceWithRating) {
        return res.status(404).json({ message: "Espaço não encontrado" });
      }

      const output = SpaceAdapter.toOutputDTOWithRating(spaceWithRating);

      return res.status(200).json(output);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao buscar espaço" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // owner_id vem do token JWT (AuthMiddleware)
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const data = { ...req.body };

      // Normalizar endereço se vier achatado (flat)
      if (!data.address && (data.city || data.state)) {
        data.address = {
          street: data.street || "",
          number: data.number || "",
          complement: data.complement,
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          state: data.state || "",
          zipcode: data.postal_code || data.zipcode || "",
          country: data.country || "Brasil",
        };
      }

      // Normalizar preços se vierem como 'price' e 'price_type' (comum no frontend antigo)
      if (data.price !== undefined && data.price_type) {
        if (data.price_type === "daily") {
          data.price_per_day = data.price;
        } else {
          // Para outros tipos, podemos usar price_per_day como padrão
          data.price_per_day = data.price;
        }
      }

      const updateSpace = SpaceUseCaseFactory.makeUpdateSpace();
      await updateSpace.execute({ id, owner_id, category_id: data.category_id, ...data });

      return res.status(200).json({ message: "Espaço atualizado com sucesso" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao atualizar espaço" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // owner_id vem do token JWT (AuthMiddleware)
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const deleteSpace = SpaceUseCaseFactory.makeDeleteSpace();
      await deleteSpace.execute({ id, owner_id });

      return res.status(200).json({ message: "Espaço excluído com sucesso" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao excluir espaço" });
    }
  }
}

export default new SpaceController();
