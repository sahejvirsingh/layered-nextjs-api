export interface Context {
  userId: string;
  workspaceId: string;
}

export interface HttpResponse {
  status: number;
  body: any;
}

export type Handler<Req, Res> = (req: Req, ctx: Context) => Promise<Res>;

export function withContext<Req, Res>(
  handler: Handler<Req, Res>,
  authCheck: (req: Req) => Promise<Context | null>
) {
  return async (req: Req): Promise<HttpResponse> => {
    const ctx = await authCheck(req);
    if (!ctx) {
      return { status: 401, body: { error: "Unauthorized" } };
    }
    
    try {
      const result = await handler(req, ctx);
      return { status: 200, body: result };
    } catch (e: any) {
      if (e.name === "ConcurrencyError") {
        return { status: 409, body: { error: e.message } };
      }
      return { status: 500, body: { error: e.message } };
    }
  };
}
