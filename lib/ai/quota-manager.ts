import { createClient } from "@/lib/supabase/server";

export interface QuotaCheck {
  allowed: boolean;
  reason?: string;
  nextAvailableAt?: Date;
}

/**
 * Check if user can request AI analysis based on quota limits
 * 
 * Limits:
 * - 3 analyses per user per day
 * - 30 minutes cooldown between analyses
 * - 1000 analyses platform-wide per day
 */
export async function checkAIQuota(userId: string): Promise<QuotaCheck> {
  const supabase = await createClient();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check user daily limit (3 analyses per day)
  const { count: userCount } = await supabase
    .from('ai_performance_analysis')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString());

  if (userCount && userCount >= 3) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      allowed: false,
      reason: 'Daily limit reached (3 analyses per day)',
      nextAvailableAt: tomorrow
    };
  }

  // Check cooldown (30 minutes between analyses)
  const { data: lastAnalysis } = await supabase
    .from('ai_performance_analysis')
    .select('analysis_generated_at')
    .eq('user_id', userId)
    .order('analysis_generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastAnalysis) {
    const timeSince = Date.now() - new Date(lastAnalysis.analysis_generated_at).getTime();
    const cooldownMs = 30 * 60 * 1000; // 30 minutes

    if (timeSince < cooldownMs) {
      const nextAvailable = new Date(Date.now() + (cooldownMs - timeSince));
      return {
        allowed: false,
        reason: 'Please wait 30 minutes between analyses',
        nextAvailableAt: nextAvailable
      };
    }
  }

  // Check platform-wide daily limit (1000 analyses per day)
  const { count: totalCount } = await supabase
    .from('ai_performance_analysis')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  if (totalCount && totalCount >= 1000) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      allowed: false,
      reason: 'Platform capacity reached. Try again tomorrow.',
      nextAvailableAt: tomorrow
    };
  }

  return { allowed: true };
}
