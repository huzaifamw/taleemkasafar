import { NextRequest, NextResponse } from "next/server";
import { getTopicsBySubject } from "@/lib/queries/admin-questions";

/**
 * API route to fetch topics for a given subject.
 * Used by QuestionFilters component for dynamic topic dropdown.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subjectId = searchParams.get("subjectId");

  if (!subjectId) {
    return NextResponse.json(
      { error: "Subject ID is required" },
      { status: 400 }
    );
  }

  try {
    const topics = await getTopicsBySubject(subjectId);
    return NextResponse.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
