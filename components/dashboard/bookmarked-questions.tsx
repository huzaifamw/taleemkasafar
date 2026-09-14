"use client";

import { useMemo, useState, useTransition } from "react";
import { toggleBookmark } from "@/app/(dashboard)/quiz-actions";
import { Icon } from "./icon";
import { MathText } from "@/components/quiz/math-text";
import type { BookmarkedQuestion } from "@/lib/queries/bookmarks";

export function BookmarkedQuestions({
  initialQuestions,
}: {
  initialQuestions: BookmarkedQuestion[];
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [subject, setSubject] = useState("all");
  const [topic, setTopic] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subjects = useMemo(
    () => Array.from(new Set(questions.map((question) => question.subjectName))).sort(),
    [questions],
  );
  const topics = useMemo(
    () =>
      Array.from(
        new Set(
          questions
            .filter((question) => subject === "all" || question.subjectName === subject)
            .map((question) => question.topicName)
            .filter((name): name is string => Boolean(name)),
        ),
      ).sort(),
    [questions, subject],
  );
  const visibleQuestions = questions.filter(
    (question) =>
      (subject === "all" || question.subjectName === subject) &&
      (topic === "all" || question.topicName === topic),
  );

  function removeBookmark(questionId: string) {
    setRemovingId(questionId);
    startTransition(async () => {
      const result = await toggleBookmark(questionId);
      if (!result.error && !result.saved) {
        setQuestions((current) =>
          current.filter((question) => question.questionId !== questionId),
        );
      }
      setRemovingId(null);
    });
  }

  if (questions.length === 0) {
    return (
      <div className="border-[3px] border-black bg-white p-10 text-center shadow-hard">
        <Icon name="bookmark_border" className="mb-4 text-5xl" />
        <h2 className="font-headline text-2xl font-bold uppercase">No saved questions yet</h2>
        <p className="mx-auto mt-2 max-w-lg text-on-surface-variant">
          Save useful questions while practising a subject or reviewing past papers,
          and they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 border-2 border-black bg-white p-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-headline text-lg font-bold uppercase">
            {visibleQuestions.length} saved question{visibleQuestions.length === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-on-surface-variant">Filtered to your selected entry test</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex items-center gap-3 font-headline text-xs font-bold uppercase">
            Subject
            <select
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setTopic("all");
              }}
              className="border-2 border-black bg-white px-3 py-2 font-body text-sm normal-case"
            >
              <option value="all">All subjects</option>
              {subjects.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 font-headline text-xs font-bold uppercase">
            Topic
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="border-2 border-black bg-white px-3 py-2 font-body text-sm normal-case"
            >
              <option value="all">All topics</option>
              {topics.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {visibleQuestions.length === 0 ? (
        <div className="border-2 border-black bg-white p-8 text-center text-on-surface-variant">
          No saved questions match these filters.
        </div>
      ) : <div className="space-y-6">
        {visibleQuestions.map((question, index) => {
          const expanded = expandedId === question.questionId;
          return (
            <article
              key={question.bookmarkId}
              className="border-[3px] border-black bg-white shadow-hard"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black bg-surface-container px-5 py-3">
                <div className="flex flex-wrap items-center gap-2 font-headline text-xs font-bold uppercase">
                  <span>Q{String(index + 1).padStart(2, "0")}</span>
                  <span className="bg-black px-2 py-1 text-white">{question.subjectName}</span>
                  {question.topicName && <span>{question.topicName}</span>}
                  <span className="border border-black px-2 py-1">{question.difficulty}</span>
                  {question.usages.map((usage) => (
                    <span key={usage} className="border border-black bg-brand-fixed px-2 py-1">
                      {usage === "past_paper" ? "Past paper" : "Practice"}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => removeBookmark(question.questionId)}
                  disabled={isPending}
                  className="flex items-center gap-1 font-headline text-xs font-bold uppercase text-danger disabled:opacity-50"
                >
                  <Icon name="bookmark_remove" className="text-lg" />
                  {removingId === question.questionId ? "Removing" : "Remove"}
                </button>
              </div>

              <div className="p-5 md:p-6">
                <p className="text-lg leading-relaxed">
                  <MathText>{question.statement}</MathText>
                </p>

                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : question.questionId)}
                  className="mt-5 flex items-center gap-2 border-2 border-black bg-black px-4 py-2 font-headline text-xs font-bold uppercase text-white transition-colors hover:bg-brand"
                  aria-expanded={expanded}
                >
                  <Icon name={expanded ? "visibility_off" : "visibility"} className="text-lg" />
                  {expanded ? "Hide answer" : "Show answer & explanation"}
                </button>

                {expanded && (
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className={`border-2 border-black p-3 ${
                            option.isCorrect ? "bg-[#dcfce7]" : "bg-white"
                          }`}
                        >
                          <span className="mr-2 font-headline font-bold">{option.label}.</span>
                          <MathText>{option.content}</MathText>
                          {option.isCorrect && (
                            <Icon name="check_circle" className="ml-2 align-middle text-[#15803d]" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="border-2 border-black bg-brand-fixed p-4">
                      <p className="mb-2 font-headline text-xs font-bold uppercase tracking-widest">
                        Explanation
                      </p>
                      <div className="leading-relaxed">
                        {question.explanation ? (
                          <MathText>{question.explanation}</MathText>
                        ) : (
                          "No explanation is available for this question."
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>}
    </div>
  );
}
