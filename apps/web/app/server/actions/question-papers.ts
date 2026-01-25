'use server';

import { revalidateTag } from 'next/cache';
import { createOrUpdateQuestionPaper, deleteQuestionPaperMutation, SavePaperInput } from '../db/mutations/question-papers';

export async function saveQuestionPaperAction(input: SavePaperInput) {
    try {
        const result = await createOrUpdateQuestionPaper(input);
        
        // Invalidate cache for the specific user's paper list
        if (result.userId) {
            revalidateTag(`question-papers-user-${result.userId}`);
        }
        
        // If updating a specific paper, invalidate that paper's cache
        if (result.paperId) {
            revalidateTag(`question-paper-${result.paperId}`);
        }

        return result;
    } catch (error: any) {
        console.error('Save Paper Action Error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteQuestionPaperAction(paperId: number, userId: number) {
  try {
    const result = await deleteQuestionPaperMutation(paperId);
    if (result.success) {
      revalidateTag(`question-papers-user-${userId}`);
      revalidateTag(`question-paper-${paperId}`);
    }
    return result;
  } catch (error: any) {
    console.error('Delete Question Paper Error:', error);
    return { success: false, error: error.message };
  }
}
