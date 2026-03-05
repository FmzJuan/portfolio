import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
// import { sdk } from "./sdk"; // Pode deixar comentado se o TS reclamar de falta de uso

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  
  // --- CÓDIGO ORIGINAL COMENTADO ---
  // let user: User | null = null;
  // try {
  //   user = await sdk.authenticateRequest(opts.req);
  // } catch (error) {
  //   user = null;
  // }
  // ---------------------------------

  // --- USUÁRIO FALSO (MOCK) PARA TESTES ---
  const user = {
    id: 1, // ou o tipo de ID que seu banco usar (ex: um UUID)
    openId: "dev-local-123",
    name: "Dev Local",
    email: "dev@local.com",
    role: "admin", // Garante que você passe no adminProcedure!
    loginMethod: "mock",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  } as User; // O "as User" força o TypeScript a aceitar esse objeto
  // ----------------------------------------

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}