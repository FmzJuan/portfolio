import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUser, users, contacts, messages, Contact, Message } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let pool: Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      if (!pool) {
        pool = new Pool({ connectionString: process.env.DATABASE_URL });
      }
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Correção para PostgreSQL: usando onConflictDoUpdate
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Contatos (Leads)
export async function getOrCreateContact(phone: string, name?: string, email?: string): Promise<Contact> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(contacts).where(eq(contacts.phone, phone)).limit(1);
  if (existing.length > 0) return existing[0];

  await db.insert(contacts).values({
    phone,
    name: name || phone,
    email: email || undefined,
  });

  // Buscar o contato recém-criado
  const newContacts = await db.select().from(contacts).where(eq(contacts.phone, phone)).limit(1);
  return newContacts[0] as Contact;
}

export async function getContactById(id: number): Promise<Contact | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listContacts(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(contacts).limit(limit).offset(offset);
}

export async function updateContactStage(contactId: number, stage: "lead" | "negociacao" | "fechado" | "perdido") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(contacts).set({ stage }).where(eq(contacts.id, contactId));
}

export async function updateContact(id: number, data: Partial<Contact>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(contacts).set(data).where(eq(contacts.id, id));
}

// Mensagens
export async function saveMessage(contactId: number, content: string, sender: "bot" | "client" | "admin", senderName?: string): Promise<Message> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(messages).values({
    contactId,
    content,
    sender,
    senderName,
  });

  // Buscar a mensagem recém-criada
  const newMessages = await db.select().from(messages)
    .where(eq(messages.contactId, contactId))
    .orderBy(desc(messages.createdAt))
    .limit(1);
  
  return newMessages[0] as Message;
}

export async function getContactMessages(contactId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(messages)
    .where(eq(messages.contactId, contactId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function markMessagesAsRead(contactId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(messages)
    .set({ isRead: true })
    .where(and(eq(messages.contactId, contactId), eq(messages.isRead, false)));
}

export async function pauseBot(contactId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(messages)
    .set({ botPaused: true })
    .where(eq(messages.contactId, contactId));
}

export async function resumeBot(contactId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(messages)
    .set({ botPaused: false })
    .where(eq(messages.contactId, contactId));
}