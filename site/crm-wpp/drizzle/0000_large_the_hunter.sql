CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'vendedor');--> statement-breakpoint
CREATE TYPE "public"."sender" AS ENUM('bot', 'client', 'admin');--> statement-breakpoint
CREATE TYPE "public"."stage" AS ENUM('lead', 'negociacao', 'fechado', 'perdido');--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(320),
	"tags" text,
	"stage" "stage" DEFAULT 'lead' NOT NULL,
	"assignedToId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contacts_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"contactId" integer NOT NULL,
	"content" text NOT NULL,
	"sender" "sender" NOT NULL,
	"senderName" varchar(255),
	"isRead" boolean DEFAULT false NOT NULL,
	"botPaused" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipelineStages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"order" integer NOT NULL,
	"color" varchar(7) DEFAULT '#3b82f6' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
