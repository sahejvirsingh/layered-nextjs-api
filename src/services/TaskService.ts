import { IRepository } from "../repositories/IRepository";
import { Task } from "../domain/Task";

export class TaskService {
  constructor(private repo: IRepository<Task>) {}

  async completeTask(id: string, prevUpdatedAt?: string) {
    const task = await this.repo.findById(id);
    if (!task) throw new Error("Task not found");
    
    if (task.status === "done") {
      return task; // Idempotent
    }

    await this.repo.update(id, { status: "done" }, prevUpdatedAt);
    return this.repo.findById(id);
  }

  async createTask(data: Omit<Task, "updated_at">) {
    const task: Task = { ...data, updated_at: new Date().toISOString() };
    await this.repo.create(task);
    return task;
  }
}
