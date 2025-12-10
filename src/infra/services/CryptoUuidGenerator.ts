import crypto from "crypto";

import { IUuidGenerator } from "../../core/services/IUuidGenerator";

export class CryptoUuidGenerator implements IUuidGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}
