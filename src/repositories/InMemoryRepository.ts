import { IRepository, ConcurrencyError } from "./IRepository";

export class InMemoryRepository<T extends { id: string; workspace_id: string; updated_at: string }> implements IRepository<T> {
  private data = new Map<string, T>();

  async findById(id: string): Promise<T | null> {
    return this.data.get(id) || null;
  }

  async findAll(workspaceId: string): Promise<T[]> {
    return Array.from(this.data.values()).filter(item => item.workspace_id === workspaceId);
  }

  async create(data: T): Promise<void> {
    this.data.set(data.id, { ...data });
  }

  async update(id: string, data: Partial<T>, prevUpdatedAt?: string): Promise<void> {
    const existing = this.data.get(id);
    if (!existing) throw new Error("Not found");
    
    if (prevUpdatedAt && existing.updated_at !== prevUpdatedAt) {
      throw new ConcurrencyError();
    }

    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    this.data.set(id, updated as T);
  }

  async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
