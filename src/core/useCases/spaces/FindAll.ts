import { ISpaceRepository } from "../../repositories/ISpaceRepository";

export class FindAllSpaces {
  private readonly _spaceRepository: ISpaceRepository;
  constructor(private spaceRepository: ISpaceRepository) {
    this._spaceRepository = spaceRepository;
  }

  async execute() {
    const spaces = await this._spaceRepository.findAll();
    if (!spaces) {
      throw new Error("Nenhum espaço encontrado");
    }
    return spaces;
  }
}
