'use server';

import { createQuestionMutation, CreateQuestionInput } from '../db/mutations/questions';
import { revalidateTag } from 'next/cache';

export async function createQuestionAction(input: CreateQuestionInput) {
  try {
    const result = await createQuestionMutation(input);
    revalidateTag('questions');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Create Question Action Error:', error);
    return { success: false, error: error.message };
  }
}
