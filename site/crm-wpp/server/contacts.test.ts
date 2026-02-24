import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createVendedorContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "vendedor-1",
    email: "vendedor@example.com",
    name: "Vendedor Test",
    loginMethod: "manus",
    role: "vendedor",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "admin-1",
    email: "admin@example.com",
    name: "Admin Test",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("contacts router", () => {
  it("vendedor pode criar um contato", async () => {
    const { ctx } = createVendedorContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contacts.create({
      name: "João Silva",
      phone: "5511999999999",
      email: "joao@example.com",
      tags: JSON.stringify(["lead-quente"]),
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("João Silva");
    expect(result.phone).toBe("5511999999999");
    expect(result.assignedToId).toBe(ctx.user.id);
  });

  it("admin pode listar todos os contatos", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contacts.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("vendedor só vê seus próprios contatos", async () => {
    const { ctx } = createVendedorContext();
    const caller = appRouter.createCaller(ctx);

    // Criar um contato
    const contact = await caller.contacts.create({
      name: "Cliente Teste",
      phone: "5511888888888",
      email: "cliente@example.com",
    });

    // Listar contatos
    const contacts = await caller.contacts.list();

    // Verificar que o contato criado está na lista
    const found = contacts.find(c => c.id === contact.id);
    expect(found).toBeDefined();
    expect(found?.assignedToId).toBe(ctx.user.id);
  });

  it("vendedor pode atualizar etapa de seu contato", async () => {
    const { ctx } = createVendedorContext();
    const caller = appRouter.createCaller(ctx);

    // Criar um contato
    const contact = await caller.contacts.create({
      name: "Cliente Teste",
      phone: "5511777777777",
      email: "cliente@example.com",
    });

    // Atualizar etapa
    const result = await caller.contacts.updateStage({
      id: contact.id,
      stage: "negociacao",
    });

    expect(result.success).toBe(true);

    // Verificar que a etapa foi atualizada
    const updated = await caller.contacts.getById({ id: contact.id });
    expect(updated.stage).toBe("negociacao");
  });

  it("vendedor não pode atualizar contato de outro vendedor", async () => {
    const { ctx: ctx1 } = createVendedorContext();
    const { ctx: ctx2 } = createVendedorContext();
    ctx2.user.id = 999; // Outro vendedor

    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // Vendedor 1 cria um contato
    const contact = await caller1.contacts.create({
      name: "Cliente Teste",
      phone: "5511666666666",
      email: "cliente@example.com",
    });

    // Vendedor 2 tenta atualizar o contato
    try {
      await caller2.contacts.updateStage({
        id: contact.id,
        stage: "fechado",
      });
      expect.fail("Deveria ter lançado um erro");
    } catch (error: any) {
      expect(error.message).toContain("Acesso negado");
    }
  });
});

describe("messages router", () => {
  it("vendedor pode enviar mensagem para seu contato", async () => {
    const { ctx } = createVendedorContext();
    const caller = appRouter.createCaller(ctx);

    // Criar um contato
    const contact = await caller.contacts.create({
      name: "Cliente Teste",
      phone: "5511555555555",
      email: "cliente@example.com",
    });

    // Enviar mensagem
    const message = await caller.messages.send({
      contactId: contact.id,
      content: "Olá, como posso ajudar?",
    });

    expect(message).toBeDefined();
    expect(message.content).toBe("Olá, como posso ajudar?");
    expect(message.sender).toBe("admin");
  });

  it("vendedor pode recuperar mensagens de seu contato", async () => {
    const { ctx } = createVendedorContext();
    const caller = appRouter.createCaller(ctx);

    // Criar um contato
    const contact = await caller.contacts.create({
      name: "Cliente Teste",
      phone: "5511444444444",
      email: "cliente@example.com",
    });

    // Enviar mensagem
    await caller.messages.send({
      contactId: contact.id,
      content: "Primeira mensagem",
    });

    // Recuperar mensagens
    const messages = await caller.messages.getByContact({ contactId: contact.id });

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].content).toBe("Primeira mensagem");
  });
});

describe("bot control router", () => {
  it("vendedor pode pausar bot para seu contato", async () => {
    const { ctx } = createVendedorContext();
    const caller = appRouter.createCaller(ctx);

    // Criar um contato
    const contact = await caller.contacts.create({
      name: "Cliente Teste",
      phone: "5511333333333",
      email: "cliente@example.com",
    });

    // Pausar bot
    const result = await caller.bot.pause({ contactId: contact.id });

    expect(result.success).toBe(true);
  });

  it("vendedor pode retomar bot para seu contato", async () => {
    const { ctx } = createVendedorContext();
    const caller = appRouter.createCaller(ctx);

    // Criar um contato
    const contact = await caller.contacts.create({
      name: "Cliente Teste",
      phone: "5511222222222",
      email: "cliente@example.com",
    });

    // Pausar bot
    await caller.bot.pause({ contactId: contact.id });

    // Retomar bot
    const result = await caller.bot.resume({ contactId: contact.id });

    expect(result.success).toBe(true);
  });
});

describe("webhook router", () => {
  it("webhook pode receber mensagem e criar contato", async () => {
    const caller = appRouter.createCaller({ user: null } as any);

    const result = await caller.webhook.receiveMessage({
      phone: "5511111111111",
      message: "Olá, gostaria de saber mais",
      senderName: "Maria Silva",
      senderEmail: "maria@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.contactId).toBeDefined();
  });

  it("webhook cria contato apenas uma vez para mesmo telefone", async () => {
    const caller = appRouter.createCaller({ user: null } as any);

    const result1 = await caller.webhook.receiveMessage({
      phone: "5511000000000",
      message: "Primeira mensagem",
      senderName: "Pedro",
    });

    const result2 = await caller.webhook.receiveMessage({
      phone: "5511000000000",
      message: "Segunda mensagem",
      senderName: "Pedro",
    });

    expect(result1.contactId).toBe(result2.contactId);
  });
});

describe("dashboard router", () => {
  it("vendedor pode ver suas métricas", async () => {
    const { ctx } = createVendedorContext();
    const caller = appRouter.createCaller(ctx);

    const metrics = await caller.dashboard.getMetrics();

    expect(metrics).toBeDefined();
    expect(metrics.newLeads).toBeDefined();
    expect(metrics.conversionRate).toBeDefined();
    expect(metrics.totalContacts).toBeDefined();
    expect(metrics.byStage).toBeDefined();
  });

  it("admin pode ver todas as métricas", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const metrics = await caller.dashboard.getMetrics();

    expect(metrics).toBeDefined();
    expect(metrics.newLeads).toBeDefined();
    expect(metrics.conversionRate).toBeDefined();
    expect(metrics.totalContacts).toBeDefined();
  });
});
