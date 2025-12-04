import { describe, expect, test, beforeEach } from "vitest";
import { soma } from "../index";

describe("teste incicial", () => {
  test("Deveria commitar normalmente", () => {
    const result = soma(3, 3);
    expect(result).toBe(6);
  });
});
