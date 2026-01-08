import { ISpaceRepository, SpaceFilters } from "../../repositories/ISpaceRepository";

export class FindAllSpaces {
  private readonly _spaceRepository: ISpaceRepository;
  constructor(private spaceRepository: ISpaceRepository) {
    this._spaceRepository = spaceRepository;
  }

  async execute() {
    const spaces = await this._spaceRepository.findAll();
    return spaces || [];
  }

  async executeWithRatings(filters?: SpaceFilters) {
    return this._spaceRepository.search(filters);
  }
}
