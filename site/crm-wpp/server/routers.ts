import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  getOrCreateContact, 
  getContactById, 
  listContacts, 
  updateContactStage, 
  updateContact,
  saveMessage,
  getContactMessages,
  markMessagesAsRead,
  pauseBot,
  resumeBot,
  getDb
} from "./db";
import { contacts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Procedure para admin apenas
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new Error('Acesso negado: apenas administradores podem acessar este recurso');
  }
  return next({ ctx });
});

// Procedure para vendedores e admins
const vendedorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'vendedor') {
    throw new Error('Acesso negado: apenas vendedores e administradores podem acessar este recurso');
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Contatos (Leads)
  contacts: router({
    list: vendedorProcedure.query(async ({ ctx }) => {
      const allContacts = await listContacts(100);
      
      // Vendedores veem apenas seus contatos
      if (ctx.user.role === 'vendedor') {
        return allContacts.filter(c => c.assignedToId === ctx.user.id);
      }
      
      // Admins veem todos
      return allContacts;
    }),

    getById: vendedorProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      const contact = await getContactById(input.id);
      if (!contact) throw new Error('Contato não encontrado');
      
      // Vendedores só veem seus contatos
      if (ctx.user.role === 'vendedor' && contact.assignedToId !== ctx.user.id) {
        throw new Error('Acesso negado a este contato');
      }
      
      return contact;
    }),

    create: vendedorProcedure.input(z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string().optional(),
      tags: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const contact = await getOrCreateContact(input.phone, input.name, input.email);
      
      // Atribuir ao vendedor que criou
      await updateContact(contact.id, {
        assignedToId: ctx.user.id,
        tags: input.tags,
      });
      
      return contact;
    }),

    updateStage: vendedorProcedure.input(z.object({
      id: z.number(),
      stage: z.enum(['lead', 'negociacao', 'fechado', 'perdido']),
    })).mutation(async ({ input, ctx }) => {
      const contact = await getContactById(input.id);
      if (!contact) throw new Error('Contato não encontrado');
      
      // Vendedores só podem atualizar seus contatos
      if (ctx.user.role === 'vendedor' && contact.assignedToId !== ctx.user.id) {
        throw new Error('Acesso negado a este contato');
      }
      
      await updateContactStage(input.id, input.stage);
      return { success: true };
    }),

    update: vendedorProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().optional(),
      tags: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const contact = await getContactById(input.id);
      if (!contact) throw new Error('Contato não encontrado');
      
      // Vendedores só podem atualizar seus contatos
      if (ctx.user.role === 'vendedor' && contact.assignedToId !== ctx.user.id) {
        throw new Error('Acesso negado a este contato');
      }
      
      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.email) updateData.email = input.email;
      if (input.tags) updateData.tags = input.tags;
      
      await updateContact(input.id, updateData);
      return { success: true };
    }),
  }),

  // Mensagens
  messages: router({
    getByContact: vendedorProcedure.input(z.object({ contactId: z.number() })).query(async ({ input, ctx }) => {
      const contact = await getContactById(input.contactId);
      if (!contact) throw new Error('Contato não encontrado');
      
      // Vendedores só veem mensagens de seus contatos
      if (ctx.user.role === 'vendedor' && contact.assignedToId !== ctx.user.id) {
        throw new Error('Acesso negado a este contato');
      }
      
      const msgs = await getContactMessages(input.contactId);
      return msgs;
    }),

    send: vendedorProcedure.input(z.object({
      contactId: z.number(),
      content: z.string(),
    })).mutation(async ({ input, ctx }) => {
      const contact = await getContactById(input.contactId);
      if (!contact) throw new Error('Contato não encontrado');
      
      // Vendedores só podem enviar mensagens para seus contatos
      if (ctx.user.role === 'vendedor' && contact.assignedToId !== ctx.user.id) {
        throw new Error('Acesso negado a este contato');
      }
      
      const message = await saveMessage(input.contactId, input.content, 'admin', ctx.user.name || 'Admin');
      return message;
    }),

    markAsRead: vendedorProcedure.input(z.object({ contactId: z.number() })).mutation(async ({ input, ctx }) => {
      const contact = await getContactById(input.contactId);
      if (!contact) throw new Error('Contato não encontrado');
      
      // Vendedores só podem marcar mensagens de seus contatos
      if (ctx.user.role === 'vendedor' && contact.assignedToId !== ctx.user.id) {
        throw new Error('Acesso negado a este contato');
      }
      
      await markMessagesAsRead(input.contactId);
      return { success: true };
    }),
  }),

  // Controle do Bot
  bot: router({
    pause: vendedorProcedure.input(z.object({ contactId: z.number() })).mutation(async ({ input, ctx }) => {
      const contact = await getContactById(input.contactId);
      if (!contact) throw new Error('Contato não encontrado');
      
      // Vendedores só podem pausar bot para seus contatos
      if (ctx.user.role === 'vendedor' && contact.assignedToId !== ctx.user.id) {
        throw new Error('Acesso negado a este contato');
      }
      
      await pauseBot(input.contactId);
      return { success: true };
    }),

    resume: vendedorProcedure.input(z.object({ contactId: z.number() })).mutation(async ({ input, ctx }) => {
      const contact = await getContactById(input.contactId);
      if (!contact) throw new Error('Contato não encontrado');
      
      // Vendedores só podem retomar bot para seus contatos
      if (ctx.user.role === 'vendedor' && contact.assignedToId !== ctx.user.id) {
        throw new Error('Acesso negado a este contato');
      }
      
      await resumeBot(input.contactId);
      return { success: true };
    }),
  }),

  // Webhook para integração com bot de WhatsApp
  webhook: router({
    receiveMessage: publicProcedure.input(z.object({
      phone: z.string(),
      message: z.string(),
      senderName: z.string().optional(),
      senderEmail: z.string().optional(),
    })).mutation(async ({ input }) => {
      // Criar ou obter contato
      const contact = await getOrCreateContact(input.phone, input.senderName, input.senderEmail);
      
      // Salvar mensagem
      await saveMessage(contact.id, input.message, 'client', input.senderName);
      
      return { success: true, contactId: contact.id };
    }),
  }),

  // Dashboard - Métricas
  dashboard: router({
    getMetrics: vendedorProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { newLeads: 0, conversionRate: 0, totalContacts: 0 };

      let allContacts: any[] = [];
      
      // Vendedores veem apenas suas métricas
      if (ctx.user.role === 'vendedor') {
        allContacts = await db.select().from(contacts).where(eq(contacts.assignedToId, ctx.user.id));
      } else {
        allContacts = await db.select().from(contacts);
      }
      
      // Contar leads novos (últimas 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newLeads = allContacts.filter(c => c.createdAt > oneDayAgo).length;
      
      // Taxa de conversão (fechados / total)
      const closed = allContacts.filter(c => c.stage === 'fechado').length;
      const conversionRate = allContacts.length > 0 ? (closed / allContacts.length) * 100 : 0;
      
      // Contatos por etapa
      const byStage = {
        lead: allContacts.filter(c => c.stage === 'lead').length,
        negociacao: allContacts.filter(c => c.stage === 'negociacao').length,
        fechado: allContacts.filter(c => c.stage === 'fechado').length,
        perdido: allContacts.filter(c => c.stage === 'perdido').length,
      };

      return {
        newLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalContacts: allContacts.length,
        byStage,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
