CREATE TABLE "chapter" (
	"chapter_id" serial PRIMARY KEY NOT NULL,
	"chapter_name" varchar(255) NOT NULL,
	"subject_id" integer
);
--> statement-breakpoint
CREATE TABLE "difficultylevel" (
	"difficulty_id" serial PRIMARY KEY NOT NULL,
	"difficulty_name" varchar(255) NOT NULL,
	CONSTRAINT "difficultylevel_difficulty_name_unique" UNIQUE("difficulty_name")
);
--> statement-breakpoint
CREATE TABLE "examquestion" (
	"exam_id" integer NOT NULL,
	"question_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam" (
	"exam_id" serial PRIMARY KEY NOT NULL,
	"exam_name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "option" (
	"option_id" serial PRIMARY KEY NOT NULL,
	"option_text" text NOT NULL,
	"question_id" integer,
	"is_correct" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "question" (
	"question_id" serial PRIMARY KEY NOT NULL,
	"question_text" text NOT NULL,
	"chapter_id" integer,
	"difficulty_id" integer
);
--> statement-breakpoint
CREATE TABLE "subject" (
	"subject_id" serial PRIMARY KEY NOT NULL,
	"subject_name" varchar(255) NOT NULL,
	"exam_id" integer
);
--> statement-breakpoint
ALTER TABLE "chapter" ADD CONSTRAINT "chapter_subject_id_subject_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("subject_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examquestion" ADD CONSTRAINT "examquestion_exam_id_exam_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("exam_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examquestion" ADD CONSTRAINT "examquestion_question_id_question_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("question_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_question_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("question_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_chapter_id_chapter_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapter"("chapter_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_difficulty_id_difficultylevel_difficulty_id_fk" FOREIGN KEY ("difficulty_id") REFERENCES "public"."difficultylevel"("difficulty_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject" ADD CONSTRAINT "subject_exam_id_exam_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("exam_id") ON DELETE no action ON UPDATE no action;