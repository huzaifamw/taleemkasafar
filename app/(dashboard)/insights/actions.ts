"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkAIQuota } from "@/lib/ai/quota-manager";
import { analyzePerformance } from "@/lib/ai/analyze-performance";

/**
 * Trigger AI analysis for a mock test attempt
 */
export async function triggerAIAnalysis(attemptId: string) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Check if analysis already exists for this attempt
  const { data: existing } = await supabase
    .from('ai_performance_analysis')
    .select('id')
    .eq('attempt_id', attemptId)
    .maybeSingle();

  if (existing) {
    return { 
      success: true, 
      analysisId: existing.id, 
      message: "Analysis already exists" 
    };
  }

  // Check quota limits
  const quotaCheck = await checkAIQuota(user.id);
  if (!quotaCheck.allowed) {
    return {
      success: false,
      error: quotaCheck.reason,
      nextAvailableAt: quotaCheck.nextAvailableAt?.toISOString()
    };
  }

  // Generate AI analysis
  try {
    const analysis = await analyzePerformance(attemptId, user.id);
    revalidatePath('/insights');
    revalidatePath('/mock');
    return { success: true, analysisId: analysis.id };
  } catch (error) {
    console.error('AI analysis error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate analysis" 
    };
  }
}

/**
 * Update study progress status for a recommendation
 */
export async function updateStudyProgress(
  progressId: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
) {
  const supabase = await createClient();

  const updates: any = { status };

  if (status === 'in_progress') {
    updates.started_at = new Date().toISOString();
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('study_progress')
    .update(updates)
    .eq('id', progressId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/insights');
  return { success: true };
}

/**
 * Check if user can request new AI analysis (quota check)
 */
export async function checkAnalysisQuota() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { allowed: false, reason: "Not authenticated" };
  }

  const quotaCheck = await checkAIQuota(user.id);
  return {
    allowed: quotaCheck.allowed,
    reason: quotaCheck.reason,
    nextAvailableAt: quotaCheck.nextAvailableAt?.toISOString()
  };
}
