import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type Question = Database["public"]["Tables"]["questions"]["Row"];
type QuestionOption = Database["public"]["Tables"]["question_options"]["Row"];

export type AdminQuestion = Question & {
  subject_name?: string;
  topic_name?: string;
  options?: QuestionOption[];
  correct_option?: QuestionOption | null;
};

export type QuestionFilters = {
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

/**
 * Get all questions with filters and pagination.
 * Only admins can access this data.
 */
export async function getAllQuestions(
  filters: QuestionFilters = {}
): Promise<{
  questions: AdminQuestion[];
  total: number;
  totalPages: number;
}> {
  const {
    subjectId,
    topicId,
    difficulty,
    search,
    page = 1,
    pageSize = 20,
  } = filters;

  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { questions: [], total: 0, totalPages: 0 };
  }

  const { data: isAdmin } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", currentUser.id)
    .eq("is_active", true)
    .single();

  if (!isAdmin) {
    return { questions: [], total: 0, totalPages: 0 };
  }

  // Build query with filters
  let query = supabase
    .from("questions")
    .select(
      `
      *,
      subjects!inner(id, name),
      topics(id, title)
    `,
      { count: "exact" }
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (subjectId) {
    query = query.eq("subject_id", subjectId);
  }

  if (topicId) {
    query = query.eq("topic_id", topicId);
  }

  if (difficulty && (difficulty === "easy" || difficulty === "medium" || difficulty === "hard")) {
    query = query.eq("difficulty", difficulty);
  }

  if (search) {
    query = query.ilike("statement", `%${search}%`);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching questions:", error);
    return { questions: [], total: 0, totalPages: 0 };
  }

  // Get options for each question
  const questionIds = data?.map((q) => q.id) || [];
  const { data: optionsData } = await supabase
    .from("question_options")
    .select("*")
    .in("question_id", questionIds)
    .order("display_order");

  // Map options to questions with label renamed from option_label
  const questions: AdminQuestion[] =
    data?.map((q: any) => ({
      ...q,
      subject_name: q.subjects?.name,
      topic_name: q.topics?.title,
      options: optionsData
        ?.filter((opt) => opt.question_id === q.id)
        .map(opt => ({ ...opt, label: opt.option_label })) || [],
      correct_option:
        optionsData?.find(
          (opt) => opt.question_id === q.id && opt.is_correct
        ) || null,
    })) || [];

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return { questions, total, totalPages };
}

/**
 * Get a single question by ID with all details.
 */
export async function getQuestionById(
  id: string
): Promise<AdminQuestion | null> {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return null;
  }

  const { data: isAdmin } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", currentUser.id)
    .eq("is_active", true)
    .single();

  if (!isAdmin) {
    return null;
  }

  const { data: question, error } = await supabase
    .from("questions")
    .select(
      `
      *,
      subjects!inner(id, name),
      topics(id, title)
    `
    )
    .eq("id", id)
    .single();

  if (error || !question) {
    return null;
  }

  // Get options
  const { data: optionsData } = await supabase
    .from("question_options")
    .select("*")
    .eq("question_id", id)
    .order("display_order");

  return {
    ...question,
    subject_name: (question as any).subjects?.name,
    topic_name: (question as any).topics?.title,
    options: optionsData?.map(opt => ({ ...opt, label: opt.option_label })) || [],
    correct_option:
      optionsData?.find((opt) => opt.is_correct) || null,
  };
}

/**
 * Get all subjects for filter dropdown.
 */
export async function getAllSubjects() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, slug")
    .order("name");

  if (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }

  return data || [];
}

/**
 * Get topics for a specific subject.
 */
export async function getTopicsBySubject(subjectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("topics")
    .select("id, title")
    .eq("subject_id", subjectId)
    .order("title");

  if (error) {
    console.error("Error fetching topics:", error);
    return [];
  }

  // Map title to name for consistency with component
  return (data || []).map(topic => ({ id: topic.id, name: topic.title }));
}
