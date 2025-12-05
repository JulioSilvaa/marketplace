import { describe, expect, it } from "vitest";
import { UserEntity } from "../../core/entities/UserEntity";
import { IUser, UserIsActive, UserRole } from "../../types/user";

describe("UserEntity", () => {
  const validUserProps: IUser = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "teste@example.com",
    name: "João Silva",
    phone: "(15)999999999",
    role: UserRole.CLIENTE,
    checked: true,
    password: "securepassword123",
    status: UserIsActive.ATIVO,
  };

  describe("Criação", () => {
    it("deve criar uma instância de UserEntity com propriedades válidas", () => {
      const user = UserEntity.create(validUserProps);
      expect(user).toBeInstanceOf(UserEntity);
      expect(user.id).toBe(validUserProps.id);
      expect(user.email).toBe(validUserProps.email);
      expect(user.name).toBe(validUserProps.name);
      expect(user.role).toBe(validUserProps.role);
      expect(user.status).toBe(validUserProps.status);
    });

    it("deve criar uma instância de UserEntity mesmo sem ID", () => {
      const { id, ...propsWithoutId } = validUserProps;
      const user = UserEntity.create(propsWithoutId as IUser);
      expect(user).toBeInstanceOf(UserEntity);
      expect(user.id).toBeUndefined();
    });
  });

  describe("Validação (Regras de Negócio)", () => {
    it("deve lançar um erro se o nome for vazio", () => {
      const props = { ...validUserProps, name: "" };
      expect(() => UserEntity.create(props)).toThrow("Nome é Obrigatorio");
    });

    it("deve lançar um erro se o nome for apenas espaços em branco", () => {
      const props = { ...validUserProps, name: "   " };
      expect(() => UserEntity.create(props)).toThrow("Nome é Obrigatorio");
    });

    it("deve lançar um erro se o nome tiver menos de 3 caracteres", () => {
      const props = { ...validUserProps, name: "Jo" };
      expect(() => UserEntity.create(props)).toThrow("Nome deve ter pelo menos 3 caracteres");
    });

    it("deve lançar um erro se o email for vazio", () => {
      const props = { ...validUserProps, email: "" };
      expect(() => UserEntity.create(props)).toThrow("Email é obrigatório");
    });

    it("deve lançar um erro se o email for inválido (sem @)", () => {
      const props = { ...validUserProps, email: "invalido.com" };
      expect(() => UserEntity.create(props)).toThrow("Email inválido");
    });

    it("deve lançar um erro se o email for inválido (sem domínio)", () => {
      const props = { ...validUserProps, email: "user@.com" };
      expect(() => UserEntity.create(props)).toThrow("Email inválido");
    });

    it("deve lançar um erro se a senha for vazia", () => {
      const props = { ...validUserProps, password: "" };
      expect(() => UserEntity.create(props)).toThrow("Senha é obrigatória");
    });

    it("deve lançar um erro se a senha tiver menos de 6 caracteres", () => {
      const props = { ...validUserProps, password: "short" };
      expect(() => UserEntity.create(props)).toThrow("Senha deve ter pelo menos 6 caracteres");
    });

    it("deve lançar um erro se o tipo (role) for inválido", () => {
      const props = {
        ...validUserProps,
        role: "admin_invalido" as unknown as UserRole,
      };
      expect(() => UserEntity.create(props)).toThrow("Role inválida");
    });
  });

  describe("Métodos e Getters", () => {
    it("deve retornar o valor correto para os getters", () => {
      const user = UserEntity.create(validUserProps);
      expect(user.id).toBe(validUserProps.id);
      expect(user.email).toBe(validUserProps.email);
      expect(user.name).toBe(validUserProps.name);
      expect(user.password).toBe(validUserProps.password);
      expect(user.role).toBe(validUserProps.role);
      expect(user.status).toBe(validUserProps.status);
    });

    it("deve retornar true para isAdmin quando o tipo for proprietario", () => {
      const props = { ...validUserProps, role: UserRole.PROPRIETARIO };
      const user = UserEntity.create(props);
      expect(user.isAdmin()).toBe(true);
      expect(user.isClient()).toBe(false);
    });

    it("deve retornar true para isClient quando o tipo for cliente", () => {
      const props = { ...validUserProps, tipo: UserRole.CLIENTE };
      const user = UserEntity.create(props);
      expect(user.isClient()).toBe(true);
      expect(user.isAdmin()).toBe(false);
    });

    it("deve permitir alterar a senha com setPassword", () => {
      const user = UserEntity.create(validUserProps);
      const newPasswordHash = "hashedpasswordfromservice";
      user.setPassword(newPasswordHash);
      expect(user.password).toBe(newPasswordHash);
    });
  });
});
