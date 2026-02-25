import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// No PostgreSQL, os Enums precisam ser declarados separadamente antes de serem usados
export const roleEnum = pgEnum("role", ["user", "admin", "vendedor"]);
export const stageEnum = pgEnum("stage", ["lead", "negociacao", "fechado", "perdido"]);
export const senderEnum = pgEnum("sender", ["bot", "client", "admin"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de contatos (leads)
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  tags: text("tags"), // JSON string com tags
  stage: stageEnum("stage").default("lead").notNull(),
  assignedToId: integer("assignedToId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// Tabela de mensagens
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  contactId: integer("contactId").notNull(),
  content: text("content").notNull(),
  sender: senderEnum("sender").notNull(),
  senderName: varchar("senderName", { length: 255 }),
  isRead: boolean("isRead").default(false).notNull(),
  botPaused: boolean("botPaused").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Tabela de etapas do funil (pipeline stages)
export const pipelineStages = pgTable("pipelineStages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  order: integer("order").notNull(),
  color: varchar("color", { length: 7 }).default("#3b82f6").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = typeof pipelineStages.$inferInsert;

// Relações (Permanecem iguais, pois independem do banco)
export const usersRelations = relations(users, ({ many }) => ({
  contacts: many(contacts),
  messages: many(messages),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [contacts.assignedToId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  contact: one(contacts, {
    fields: [messages.contactId],
    references: [contacts.id],
  }),
}));