CREATE TABLE "institution" (
	"institution_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(64),
	"type" varchar(50),
	"address" text,
	"contact_email" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_paper_item" (
	"question_paper_item_id" serial PRIMARY KEY NOT NULL,
	"question_paper_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"order_index" integer NOT NULL,
	"marks" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_paper" (
	"question_paper_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"exam_date" timestamp with time zone,
	"duration_minutes" integer,
	"total_marks" integer DEFAULT 0,
	"instructions" text,
	"subject_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"status" varchar(50) DEFAULT 'draft'
);
--> statement-breakpoint
CREATE TABLE "question_usage" (
	"question_usage_id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"question_paper_id" integer NOT NULL,
	"used_by" integer NOT NULL,
	"used_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" text,
	"role" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"institution_id" integer
);
--> statement-breakpoint
ALTER TABLE "question_paper_item" ADD CONSTRAINT "question_paper_item_question_paper_id_question_paper_question_paper_id_fk" FOREIGN KEY ("question_paper_id") REFERENCES "public"."question_paper"("question_paper_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_paper_item" ADD CONSTRAINT "question_paper_item_question_id_question_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("question_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_paper" ADD CONSTRAINT "question_paper_subject_id_subject_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("subject_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_paper" ADD CONSTRAINT "question_paper_created_by_user_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_usage" ADD CONSTRAINT "question_usage_question_id_question_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("question_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_usage" ADD CONSTRAINT "question_usage_question_paper_id_question_paper_question_paper_id_fk" FOREIGN KEY ("question_paper_id") REFERENCES "public"."question_paper"("question_paper_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_usage" ADD CONSTRAINT "question_usage_used_by_user_user_id_fk" FOREIGN KEY ("used_by") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_institution_id_institution_institution_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institution"("institution_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" DROP COLUMN "usage_count";