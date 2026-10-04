export class IdempotencyStore {
  private store = new Map<string, { response: any }>();

  async checkAndRecord(key: string | null): Promise<{ isDuplicate: boolean; response?: any }> {
    if (!key) return { isDuplicate: false };

    if (this.store.has(key)) {
      return { isDuplicate: true, response: this.store.get(key)?.response };
    }
    
    // We reserve the key. Response is populated later.
    this.store.set(key, { response: null });
    return { isDuplicate: false };
  }

  async saveResponse(key: string, response: any) {
    this.store.set(key, { response });
  }
}
