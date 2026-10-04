export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(workspaceId: string): Promise<T[]>;
  create(data: T): Promise<void>;
  update(id: string, data: Partial<T>, prevUpdatedAt?: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export class ConcurrencyError extends Error {
  constructor() {
    super("Concurrency conflict: The resource has been updated by another request.");
    this.name = "ConcurrencyError";
  }
}
