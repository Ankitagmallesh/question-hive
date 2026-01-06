ALTER TABLE "chapter" ADD COLUMN "chapter_code" varchar(64);--> statement-breakpoint
ALTER TABLE "chapter" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "chapter" ADD COLUMN "weightage" double precision;--> statement-breakpoint
ALTER TABLE "chapter" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "exam" ADD COLUMN "code" varchar(64);--> statement-breakpoint
ALTER TABLE "exam" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "type" varchar(50);--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "difficulty" varchar(32);--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "marks" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "subject_id" integer;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "options" text;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "correct_answer" text;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "explanation" text;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "is_ai_generated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "usage_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subject" ADD COLUMN "subject_code" varchar(64);--> statement-breakpoint
ALTER TABLE "subject" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "subject" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_subject_id_subject_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("subject_id") ON DELETE no action ON UPDATE no action;