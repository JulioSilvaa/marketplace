import { describe, expect, it } from "vitest";

import { UserAdapter } from "../../infra/adapters/UserAdapter";
import { IUser, UserIsActive, UserRole } from "../../types/user";

describe("UserAdapter", () => {
  describe("toOutputDTO", () => {
    it("should convert IUser to UserOutputDTO excluding password", () => {
      const user: IUser = {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        phone: "11999999999",
        password: "secret-password-123",
        role: UserRole.CLIENTE,
        checked: true,
        status: UserIsActive.ATIVO,
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-10"),
      };

      const output = UserAdapter.toOutputDTO(user);

      expect(output.id).toBe("user-1");
      expect(output.name).toBe("John Doe");
      expect(output.email).toBe("john@example.com");
      expect(output.phone).toBe("11999999999");
      expect(output.role).toBe("client");
      expect(output.checked).toBe(true);
      expect(output.status).toBe("active");
      expect(output.created_at).toBe("2025-01-01T00:00:00.000Z");
      expect(output.updated_at).toBe("2025-01-10T00:00:00.000Z");

      // Critical: password should NOT be in output
      expect(output).not.toHaveProperty("password");
      expect((output as any).password).toBeUndefined();
    });

    it("should handle undefined dates", () => {
      const user: IUser = {
        id: "user-1",
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "11888888888",
        password: "secret",
        role: UserRole.PROPRIETARIO,
        checked: false,
        status: UserIsActive.ATIVO,
      };

      const output = UserAdapter.toOutputDTO(user);

      expect(output.role).toBe("owner");
      expect(output.checked).toBe(false);
      expect(output.status).toBe("active");
      expect(output.created_at).toBeUndefined();
      expect(output.updated_at).toBeUndefined();
    });
  });

  describe("toListOutputDTO", () => {
    it("should convert array of IUser to UserListOutputDTO excluding passwords", () => {
      const user1: IUser = {
        id: "user-1",
        name: "User 1",
        email: "user1@example.com",
        phone: "11111111111",
        password: "password1",
        role: UserRole.CLIENTE,
        checked: true,
        status: UserIsActive.ATIVO,
      };

      const user2: IUser = {
        id: "user-2",
        name: "User 2",
        email: "user2@example.com",
        phone: "22222222222",
        password: "password2",
        role: UserRole.PROPRIETARIO,
        checked: false,
        status: UserIsActive.INATIVO,
      };

      const output = UserAdapter.toListOutputDTO([user1, user2]);

      expect(output.total).toBe(2);
      expect(output.data).toHaveLength(2);
      expect(output.data[0].id).toBe("user-1");
      expect(output.data[1].id).toBe("user-2");

      // Verify passwords are excluded from all users
      output.data.forEach(userOutput => {
        expect(userOutput).not.toHaveProperty("password");
      });
    });
  });
});
