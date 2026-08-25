"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminButton } from "./admin-button";

type Subject = { id: string; name: string; slug: string };
type Topic = { id: string; name: string };

type QuestionFiltersProps = {
  initialSubject: string;
  initialTopic: string;
  initialDifficulty: string;
  initialSearch: string;
  subjects: Subject[];
};

/**
 * Filter controls for questions list with Soft Brutalist design.
 */
export function QuestionFilters({
  initialSubject,
  initialTopic,
  initialDifficulty,
  initialSearch,
  subjects,
}: QuestionFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [search, setSearch] = useState(initialSearch);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Load topics when subject changes
  useEffect(() => {
    if (subject) {
      setLoadingTopics(true);
      fetch(`/admin/questions/api/topics?subjectId=${subject}`)
        .then((res) => res.json())
        .then((data) => {
          setTopics(data || []);
          setLoadingTopics(false);
        })
        .catch((err) => {
          console.error("Error loading topics:", err);
          setTopics([]);
          setLoadingTopics(false);
        });
    } else {
      setTopics([]);
      setTopic("");
    }
  }, [subject]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (subject) params.set("subject", subject);
    if (topic) params.set("topic", topic);
    if (difficulty) params.set("difficulty", difficulty);
    if (search) params.set("search", search);

    startTransition(() => {
      router.push(`/admin/questions?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSubject("");
    setTopic("");
    setDifficulty("");
    setSearch("");

    startTransition(() => {
      router.push("/admin/questions");
    });
  };

  return (
    <div className="space-y-4 border-2 border-black bg-white p-4 shadow-hard md:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Search Statement
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full border-2 border-black px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Subject Filter */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Subject
          </label>
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setTopic("");
            }}
            className="w-full border-2 border-black px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">All Subjects</option>
            {subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Topic/Chapter
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={!subject || loadingTopics}
            className="w-full border-2 border-black px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {loadingTopics ? "Loading..." : "All Topics"}
            </option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full border-2 border-black px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <AdminButton onClick={applyFilters} disabled={isPending} variant="primary" size="sm">
          {isPending ? "Applying..." : "Apply Filters"}
        </AdminButton>
        <AdminButton onClick={clearFilters} disabled={isPending} variant="secondary" size="sm">
          Clear All
        </AdminButton>
      </div>
    </div>
  );
}
