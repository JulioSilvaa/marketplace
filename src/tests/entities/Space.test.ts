import { describe, expect, it } from "vitest";
import { SpaceEntity } from "../../core/entities/SpaceEntity";
import { IEspace, spaceStatus, IAddress } from "../../types/Space";

const mockValidAddress: IAddress = {
  street: "Rua Principal",
  number: "123A",
  complement: "Ap. 101",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
  zipcode: "01000-000",
  country: "Brasil",
};

const mockValidSpaceProps: IEspace = {
  id: "space-id-123",
  owner_id: "owner-id-987",
  title: "Espaço de Eventos Central",
  description: "Um ótimo espaço para festas e reuniões com excelente infraestrutura.",
  address: mockValidAddress,
  capacity: 150,
  price_per_weekend: 3500.5,
  price_per_day: 1200.0,
  comfort: ["Wi-Fi", "Ar Condicionado", "Estacionamento"],
  images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  status: "active",
};

describe("SpaceEntity", () => {
  describe("Criação e Getters", () => {
    it("deve criar uma instância da SpaceEntity com dados válidos", () => {
      const space = SpaceEntity.create(mockValidSpaceProps);
      expect(space).toBeInstanceOf(SpaceEntity);
    });

    it("deve retornar os valores corretos através dos getters", () => {
      const space = SpaceEntity.create(mockValidSpaceProps);

      // Testando alguns getters chave
      expect(space.id).toBe(mockValidSpaceProps.id);
      expect(space.owner_id).toBe(mockValidSpaceProps.owner_id);
      expect(space.title).toBe("Espaço de Eventos Central");
      expect(space.capacity).toBe(150);
      expect(space.status).toBe("active");
      expect(space.images.length).toBe(2);
      expect(space.address.zipcode).toBe("01000-000");
    });
  });

  describe("Validações (Sad Path)", () => {
    it("deve lançar erro se o owner_id for inválido", () => {
      const invalidProps = { ...mockValidSpaceProps, owner_id: "" };
      expect(() => SpaceEntity.create(invalidProps)).toThrow(
        "ID do proprietário (owner_id) é obrigatório e deve ser uma string."
      );
    });

    it("deve lançar erro se o título for muito curto", () => {
      const invalidProps = { ...mockValidSpaceProps, title: "Curto" };
      expect(() => SpaceEntity.create(invalidProps)).toThrow(
        "O título deve ter entre 6 e 100 caracteres"
      );
    });

    it("deve lançar erro se a capacidade for zero ou negativa", () => {
      const invalidPropsZero = { ...mockValidSpaceProps, capacity: 0 };
      const invalidPropsNegativa = { ...mockValidSpaceProps, capacity: -10 };

      expect(() => SpaceEntity.create(invalidPropsZero)).toThrow(
        "A capacidade (capacity) deve ser um número inteiro positivo maior que zero."
      );
      expect(() => SpaceEntity.create(invalidPropsNegativa)).toThrow(
        "A capacidade (capacity) deve ser um número inteiro positivo maior que zero."
      );
    });

    it("deve lançar erro se nenhum preço for fornecido", () => {
      const invalidProps = {
        ...mockValidSpaceProps,
        price_per_weekend: undefined,
        price_per_day: undefined,
      };
      expect(() => SpaceEntity.create(invalidProps)).toThrow(
        "Pelo menos o preço por fim de semana ou o preço por dia deve ser fornecido."
      );
    });

    it("deve lançar erro se o array de comfort for vazio", () => {
      const invalidProps = { ...mockValidSpaceProps, comfort: [] };
      expect(() => SpaceEntity.create(invalidProps)).toThrow(
        "É necessário listar pelo menos um item de conforto para Espaços ativos."
      );
    });

    it("NÃO deve lançar erro se comfort for vazio para SERVICE", () => {
      const validServiceProps = { ...mockValidSpaceProps, type: "SERVICE" as const, comfort: [] };
      const space = SpaceEntity.create(validServiceProps);
      expect(space).toBeInstanceOf(SpaceEntity);
    });

    it("NÃO deve lançar erro se comfort for vazio para EQUIPMENT", () => {
      const validEquipProps = { ...mockValidSpaceProps, type: "EQUIPMENT" as const, comfort: [] };
      const space = SpaceEntity.create(validEquipProps);
      expect(space).toBeInstanceOf(SpaceEntity);
    });

    it("deve lançar erro se as imagens não tiverem URL válido", () => {
      const invalidProps = {
        ...mockValidSpaceProps,
        images: ["https://valid.com/img.jpg", "isso-nao-e-um-url"],
      };
      expect(() => SpaceEntity.create(invalidProps)).toThrow(
        "Pelo menos um link de imagem fornecido não é um URL válido."
      );
    });
  });

  describe("Validação de IAddress", () => {
    it("deve lançar erro se o CEP (zipcode) for inválido", () => {
      const invalidAddress = { ...mockValidAddress, zipcode: "1234567" }; // Faltando dígito
      const invalidProps = { ...mockValidSpaceProps, address: invalidAddress };

      expect(() => SpaceEntity.create(invalidProps)).toThrow(
        "Endereço: O CEP (zipcode) é obrigatório e deve ser válido"
      );
    });

    it("deve lançar erro se o estado (state) tiver o tamanho errado", () => {
      const invalidAddress = { ...mockValidAddress, state: "São Paulo" }; // Mais de 2 caracteres
      const invalidProps = { ...mockValidSpaceProps, address: invalidAddress };

      expect(() => SpaceEntity.create(invalidProps)).toThrow(
        "Endereço: O estado (state) é obrigatório e deve ter 2 caracteres"
      );
    });

    it("deve lançar erro se o bairro (neighborhood) estiver faltando", () => {
      const invalidAddress = { ...mockValidAddress, neighborhood: "" };
      const invalidProps = { ...mockValidSpaceProps, address: invalidAddress };

      expect(() => SpaceEntity.create(invalidProps)).toThrow(
        "Endereço: O bairro (neighborhood) é obrigatório."
      );
    });
  });
});
