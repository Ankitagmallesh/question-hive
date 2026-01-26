ALTER TABLE "question_paper_items" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "credits" integer DEFAULT 150 NOT NULL;--> statement-breakpoint
CREATE INDEX "question_options_question_id_idx" ON "question_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "question_paper_items_paper_id_idx" ON "question_paper_items" USING btree ("question_paper_id");--> statement-breakpoint
CREATE INDEX "question_papers_created_by_idx" ON "question_papers" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "question_papers_updated_at_idx" ON "question_papers" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "questions_chapter_id_idx" ON "questions" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "questions_subject_id_idx" ON "questions" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "questions_type_id_idx" ON "questions" USING btree ("question_type_id");--> statement-breakpoint
CREATE INDEX "questions_difficulty_id_idx" ON "questions" USING btree ("difficulty_level_id");