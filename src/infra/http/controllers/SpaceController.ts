/* eslint-disable no-undef */
import { Request, Response } from "express";

import { SpaceAdapter } from "../../adapters/SpaceAdapter";
import { AuditLogUseCaseFactory } from "../../factories/AuditLogUseCaseFactory";
import { SpaceUseCaseFactory } from "../../factories/SpaceUseCaseFactory";
import { redisService } from "../../services/RedisService";

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

          // Upload da imagem otimizada
          const imageUrl = await storageService.uploadImage(
            BUCKET_NAME,
            `${basePath}/${uniqueName}.webp`,
            processed.image,
            "image/webp"
          );

          // Salvar URL da imagem
          imageUrls.push(imageUrl);
        }
      }

      // Parsear dados do formulário
      let spaceData = req.body;
      console.log("🛠️ SpaceController: req.body.type received:", spaceData.type);
      console.log("🛠️ SpaceController: All body keys:", Object.keys(spaceData));

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

      // STRICT PARSING FOR CATEGORY_ID
      // Sometimes it comes as string "5", sometimes number 5.
      if (spaceData.category_id !== undefined && spaceData.category_id !== null) {
        const parsed = parseInt(String(spaceData.category_id));
        if (!isNaN(parsed)) {
          spaceData.category_id = parsed;
        } else {
          console.error("Invalid category_id received:", spaceData.category_id);
          // Fallback or let it fail, but now we know.
          // Prisma expects Int or Null. If NaN, it might be an issue.
          // We'll set it to null or undefined if invalid to verify behavior?
          // Better strictly set it.
        }
      }

      const createSpace = SpaceUseCaseFactory.makeCreateSpace();
      const space = await createSpace.execute({
        ...spaceData,
        owner_id,
        price_unit: spaceData.price_type || spaceData.price_unit || "day",
        images: imageUrls.length > 0 ? imageUrls : spaceData.images || [],
      });

      // Invalidate general search cache
      // Since new items appear at top, we really should just bust the whole search cache or at least common keys.
      // For simplicity in MVP, we might rely on TTL (5m) or Bust specific keys if we had them tracked.
      // Or we can just let it be eventually consistent (5 min delay for new ads on public query is acceptable).

      // 📝 AUDIT LOG: Space Created
      const createAuditLog = AuditLogUseCaseFactory.makeCreateAuditLog();
      await createAuditLog.execute({
        userId: owner_id,
        action: "CREATE_SPACE",
        resourceId: space.id,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        details: { title: space.title, category_id: space.category_id },
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
      // Owner queries are dynamic and sensitive, usually NOT cached strongly or cached with owner_id key.
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

      // Public Search - Candidate for Caching
      const cacheKey = redisService.generateKey("spaces:search", req.query);
      const cached = await redisService.get(cacheKey);

      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      // Caso contrário, lista todos os espaços COM ratings
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const offset = (page - 1) * limit;

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
      const sort = req.query.sort as string;
      const type = req.query.type as string;
      const order = (req.query.order as "asc" | "desc") || "desc";

      const findAllSpaces = SpaceUseCaseFactory.makeFindAllSpaces();
      const spacesWithRatings = await findAllSpaces.executeWithRatings({
        limit,
        offset,
        city,
        state,
        category_id,
        price_min,
        price_max,
        search,
        neighborhood,
        sort,
        order,
        type,
      });

      const output = SpaceAdapter.toListOutputDTOWithRatings(spacesWithRatings.data);

      const response = {
        spaces: output.data,
        pagination: {
          total: spacesWithRatings.total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(spacesWithRatings.total / limit) || 1,
        },
      };

      // Cache result for 5 minutes
      await redisService.set(cacheKey, JSON.stringify(response), 300);

      return res.status(200).json(response);
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

      // Check Cache
      const cacheKey = `space:${id}`;
      const cached = await redisService.get(cacheKey);

      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const findByIdSpace = SpaceUseCaseFactory.makeFindByIdSpace();
      const spaceWithRating = await findByIdSpace.executeWithRating(id);

      if (!spaceWithRating) {
        return res.status(404).json({ message: "Espaço não encontrado" });
      }

      const output = SpaceAdapter.toOutputDTOWithRating(spaceWithRating);

      // Cache for 15 minutes
      await redisService.set(cacheKey, JSON.stringify(output), 900);

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

      // Map price_type to price_unit for database storage
      if (data.price_type) {
        data.price_unit = data.price_type;
      }

      const updateSpace = SpaceUseCaseFactory.makeUpdateSpace();
      await updateSpace.execute({ id, owner_id, category_id: data.category_id, ...data });

      // Invalidate Cache
      await redisService.del(`space:${id}`);

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

      // Invalidate Cache
      await redisService.del(`space:${id}`);

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
