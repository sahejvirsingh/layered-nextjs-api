import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryRepository, ConcurrencyError } from "../src/repositories/InMemoryRepository";
import { TaskService } from "../src/services/TaskService";
import { Task } from "../src/domain/Task";
import { IdempotencyStore } from "../src/http/idempotency";
import { withContext } from "../src/http/api-context";

describe("Layered Architecture API", () => {
  let repo: InMemoryRepository<Task>;
  let service: TaskService;

  beforeEach(() => {
    repo = new InMemoryRepository<Task>();
    service = new TaskService(repo);
  });

  it("should create and update a task via service", async () => {
    const task = await service.createTask({
      id: "123",
      title: "Test Task",
      status: "todo",
      workspace_id: "ws-1"
    });

    expect(task.title).toBe("Test Task");
    
    // Complete the task
    const updated = await service.completeTask("123", task.updated_at);
    expect(updated?.status).toBe("done");
  });

  it("should enforce optimistic concurrency control", async () => {
    const task = await service.createTask({
      id: "123",
      title: "Test Task",
      status: "todo",
      workspace_id: "ws-1"
    });

    // Simulate another request modifying it first (timestamp changes)
    await repo.update("123", { title: "Changed" });

    // Trying to complete with old timestamp should throw ConcurrencyError (409)
    await expect(service.completeTask("123", task.updated_at)).rejects.toThrow(ConcurrencyError);
  });

  it("should handle API context and error wrapping gracefully", async () => {
    const mockHandler = async (req: any, ctx: any) => {
      throw new ConcurrencyError();
    };
    
    const endpoint = withContext(mockHandler, async () => ({ userId: "u1", workspaceId: "ws1" }));
    
    const response = await endpoint({});
    expect(response.status).toBe(409);
    expect(response.body.error).toContain("Concurrency conflict");
  });

  it("should enforce idempotency for requests", async () => {
    const store = new IdempotencyStore();
    
    const req1 = await store.checkAndRecord("txn-1");
    expect(req1.isDuplicate).toBe(false);
    await store.saveResponse("txn-1", { ok: true });

    const req2 = await store.checkAndRecord("txn-1");
    expect(req2.isDuplicate).toBe(true);
    expect(req2.response).toEqual({ ok: true });
  });
});
