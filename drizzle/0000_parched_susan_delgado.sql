CREATE TABLE "agora" (
	"id" text PRIMARY KEY DEFAULT 'agora' NOT NULL,
	"atualizado_em" date,
	"body_html" text,
	"body_json" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "atualizacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" date NOT NULL,
	"tipo" text NOT NULL,
	"titulo" text NOT NULL,
	"referencia_slug" text,
	"situacao" text DEFAULT 'publicado' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identidade" (
	"id" text PRIMARY KEY DEFAULT 'identidade' NOT NULL,
	"nome" text NOT NULL,
	"tagline" text,
	"slogan" text,
	"bio_curta" text,
	"descricao_meta" text,
	"email" text,
	"linkedin_url" text,
	"og_image" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"resumo" text NOT NULL,
	"data" date NOT NULL,
	"publicar_em" timestamp with time zone,
	"capa_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"fonte_externa_url" text,
	"fonte_externa_nome" text,
	"idioma" text DEFAULT 'pt' NOT NULL,
	"body_html" text,
	"body_json" jsonb,
	"situacao" text DEFAULT 'publicado' NOT NULL,
	"ordem" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "projetos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"subtitulo" text,
	"status" text NOT NULL,
	"inicio" date NOT NULL,
	"fim" date,
	"cliente" text,
	"papel" text,
	"resumo" text NOT NULL,
	"problema" text,
	"abordagem" text,
	"resultado" text,
	"link" text,
	"repo" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"destaque" boolean DEFAULT false NOT NULL,
	"body_html" text,
	"body_json" jsonb,
	"situacao" text DEFAULT 'publicado' NOT NULL,
	"ordem" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projetos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL,
	"categoria" text NOT NULL,
	"area" text NOT NULL,
	"nivel" text,
	"instituicao" text,
	"instituicao_url" text,
	"ano" integer,
	"credencial_url" text,
	"descricao" text,
	"destaque" boolean DEFAULT false NOT NULL,
	"body_html" text,
	"body_json" jsonb,
	"situacao" text DEFAULT 'publicado' NOT NULL,
	"ordem" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"cargo" text NOT NULL,
	"empresa" text NOT NULL,
	"empresa_url" text,
	"inicio" date NOT NULL,
	"fim" date,
	"local" text,
	"tipo" text,
	"resumo" text,
	"destaques" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"destaque" boolean DEFAULT false NOT NULL,
	"body_html" text,
	"body_json" jsonb,
	"situacao" text DEFAULT 'publicado' NOT NULL,
	"ordem" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "timeline_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"nome" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"situacao" text DEFAULT 'publicado' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;