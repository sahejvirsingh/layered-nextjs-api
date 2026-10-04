import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  workspace_id: z.string().uuid(),
  updated_at: z.string(),
});

export type Task = z.infer<typeof TaskSchema>;
