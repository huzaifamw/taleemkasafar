export type BlogSection = {
  heading: string;
  paragraphs: string[];
  points?: string[];
  callout?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Study Smart" | "Entry Tests" | "Wellbeing" | "Exam Strategy";
  publishedAt: string;
  readTime: string;
  author: string;
  authorRole: string;
  icon: string;
  color: string;
  featured?: boolean;
  sections: BlogSection[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "25-minute-focus-method",
    title: "The 25-minute focus method that actually works",
    excerpt: "A practical, evidence-informed routine for covering difficult chapters without exhausting your attention.",
    category: "Study Smart",
    publishedAt: "August 28, 2026",
    readTime: "6 min read",
    author: "Taleem Editorial",
    authorRole: "Learning & preparation team",
    icon: "timer",
    color: "bg-brand-fixed",
    featured: true,
    sections: [
      { heading: "Why short focus blocks help", paragraphs: ["Long study sessions often feel productive because they take time, but time spent is not the same as attention used well. A short, protected focus block gives your brain one clear job and a visible finish line.", "The familiar 25-minute method is useful when it is treated as a framework rather than a strict timer. The goal is to reduce the resistance to starting, remove distractions, and create a repeatable rhythm."], callout: "A good focus block has one target: not ‘study physics,’ but ‘solve 12 work-and-energy MCQs and review every mistake.’" },
      { heading: "Build a block that produces results", paragraphs: ["Before starting the timer, write down the exact output you want. Keep your phone outside reach, close unrelated tabs, and prepare the book, formula sheet, or practice set you need."], points: ["Choose one chapter-level objective.", "Work for 25 minutes without switching tasks.", "Mark uncertain questions instead of opening new resources.", "Take a genuine five-minute break away from the screen.", "After four blocks, take a longer 20–30 minute break."] },
      { heading: "Use the final three minutes", paragraphs: ["Do not let the timer end with the last question. Reserve the final minutes to write what you understood, what remained confusing, and the first action for your next block. This tiny review prevents every session from starting at zero."], callout: "Track completed outcomes, not hours. Four focused blocks with reviewed mistakes can outperform an unfocused afternoon." },
      { heading: "When 25 minutes is not enough", paragraphs: ["For full mock tests, deep mathematics, or long reading passages, extend the block to 40 or 50 minutes. Keep the same principles: one objective, no task switching, and a planned recovery break. The method should serve the work—not interrupt it."] },
    ],
  },
  {
    slug: "review-a-mock-test",
    title: "How to review a mock test the right way",
    excerpt: "Your score is only the beginning. Use a simple review system to turn each attempt into your next study plan.",
    category: "Entry Tests",
    publishedAt: "August 24, 2026",
    readTime: "8 min read",
    author: "Taleem Editorial",
    authorRole: "Assessment design team",
    icon: "fact_check",
    color: "bg-[#ffe8a3]",
    featured: true,
    sections: [
      { heading: "Do not stop at the score", paragraphs: ["A mock test is a diagnostic tool. The number at the end tells you where you are, but the review tells you how to move. Students who repeatedly attempt mocks without analysing them often repeat the same mistakes under slightly different wording.", "Review while the reasoning is still fresh, ideally after a short break on the same day."], callout: "The most valuable question after a mock is not ‘What did I score?’ It is ‘Why did I lose each mark?’" },
      { heading: "Sort every lost mark", paragraphs: ["Classify incorrect and skipped questions. Four categories are enough to expose most patterns."], points: ["Knowledge gap: you did not know the concept or formula.", "Application gap: you knew the concept but could not use it.", "Reading error: you missed a condition, unit, or keyword.", "Time decision: you spent too long, rushed, or left an answer late."] },
      { heading: "Create a correction loop", paragraphs: ["For each knowledge or application gap, revisit the smallest relevant concept—not the entire subject. Then solve three to five similar questions without looking at the solution. For reading and time errors, write a behavioural rule such as ‘underline units before calculating.’"], callout: "A mistake is reviewed only when you can solve a similar question correctly without help." },
      { heading: "Plan the next seven days", paragraphs: ["Choose the two weakest high-impact areas from your analysis. Schedule focused practice early in the week, a mixed retrieval session later, and another timed section at the end. This creates a cycle of diagnose, repair, and verify."] },
    ],
  },
  {
    slug: "calm-before-exam-day",
    title: "Calm your mind before exam day",
    excerpt: "Simple habits to protect your sleep, focus, and confidence during the final days of preparation.",
    category: "Wellbeing",
    publishedAt: "August 19, 2026",
    readTime: "5 min read",
    author: "Taleem Editorial",
    authorRole: "Student success team",
    icon: "self_improvement",
    color: "bg-[#c8f4d4]",
    sections: [
      { heading: "Treat calm as part of preparation", paragraphs: ["Feeling nervous before an important test is normal. The aim is not to remove every anxious thought; it is to keep your body and attention stable enough to use what you have learned.", "In the final days, consistency matters more than squeezing in one heroic night of study."], callout: "Your exam-day brain is built during the nights before the exam, not during the final hour of revision." },
      { heading: "Protect the basics", paragraphs: ["Keep sleep and waking times steady. Eat familiar foods, drink enough water, and include light movement during the day. Avoid experimenting with new supplements, extreme caffeine, or an unfamiliar sleep schedule."], points: ["Prepare documents and travel plans the night before.", "Stop heavy revision at a defined time.", "Use a short formula or concept sheet for the final review.", "Keep the morning routine simple and familiar."] },
      { heading: "Use a two-minute reset", paragraphs: ["If panic rises during the test, place both feet on the floor, relax your jaw, and breathe out slightly longer than you breathe in. Then identify the next smallest action: read one sentence, underline one value, or eliminate one option."], callout: "You do not need to feel perfectly confident to answer the next question well." },
    ],
  },
  {
    slug: "build-an-error-log",
    title: "Build an error log you will actually use",
    excerpt: "A lightweight system for capturing mistakes, finding patterns, and stopping repeated errors.",
    category: "Study Smart",
    publishedAt: "August 14, 2026",
    readTime: "7 min read",
    author: "Taleem Editorial",
    authorRole: "Learning & preparation team",
    icon: "edit_note",
    color: "bg-[#ffd6e7]",
    sections: [
      { heading: "Keep it smaller than you think", paragraphs: ["An error log fails when maintaining it becomes another subject. Record only information that changes future behaviour: the topic, the reason for the mistake, the correct idea, and when you will test it again."], callout: "Your error log is a decision tool, not a museum of every question you answered incorrectly." },
      { heading: "Use four useful fields", paragraphs: ["For every important mistake, capture a compact record."], points: ["Topic and question reference.", "Mistake type: knowledge, application, reading, or timing.", "One-sentence correction in your own words.", "A review date and one similar practice question."] },
      { heading: "Review by pattern", paragraphs: ["Once a week, group entries by subject and mistake type. If most losses are reading errors, another lecture is unlikely to help. If one concept appears repeatedly, schedule a focused repair session before attempting more mixed tests."] },
    ],
  },
  {
    slug: "manage-time-in-mcq-exams",
    title: "A practical timing strategy for MCQ exams",
    excerpt: "Use passes, checkpoints, and deliberate skipping to protect easy marks under time pressure.",
    category: "Exam Strategy",
    publishedAt: "August 8, 2026",
    readTime: "6 min read",
    author: "Taleem Editorial",
    authorRole: "Assessment design team",
    icon: "pace",
    color: "bg-[#d9f1ff]",
    sections: [
      { heading: "Time is a scoring resource", paragraphs: ["A difficult question can consume the minutes needed for several straightforward ones. Strong timing is not about answering every question quickly; it is about investing time where it has the highest chance of producing marks."], callout: "Skipping is not surrender. It is a decision to protect the rest of your paper." },
      { heading: "Use a three-pass system", paragraphs: ["Move through the paper with different intentions."], points: ["Pass one: answer questions you can solve confidently and quickly.", "Pass two: return to questions that need calculation or closer reasoning.", "Pass three: handle the hardest items, educated guesses, and final checks."] },
      { heading: "Create checkpoints", paragraphs: ["Before the exam, divide total time into subject or question checkpoints and reserve a final review buffer. Practice those checkpoints in mocks until they feel automatic. Adjust them using real attempt data rather than intuition."] },
    ],
  },
  {
    slug: "active-recall-for-formulas",
    title: "Remember formulas with active recall",
    excerpt: "Replace repeated reading with a retrieval routine that makes formulas available when the clock is running.",
    category: "Exam Strategy",
    publishedAt: "August 2, 2026",
    readTime: "5 min read",
    author: "Taleem Editorial",
    authorRole: "Learning & preparation team",
    icon: "functions",
    color: "bg-[#e7dcff]",
    sections: [
      { heading: "Recognition is not recall", paragraphs: ["A formula can look familiar on a page but remain unavailable during an exam. Retrieval practice closes this gap by making your brain produce the formula before seeing it."], callout: "If the formula is always visible while you study, you are practising recognition—not exam-day recall." },
      { heading: "Use blank-page retrieval", paragraphs: ["Choose one chapter, close your notes, and write every relevant formula you can remember. Then compare, correct in a different colour, and explain what each variable means."], points: ["Recall the formula from a chapter prompt.", "State when it applies and any limiting conditions.", "Check dimensions or units.", "Solve one direct and one mixed application."] },
      { heading: "Space the reviews", paragraphs: ["Repeat retrieval after one day, three days, one week, and two weeks. Short spaced sessions are more useful than copying the same sheet repeatedly in one evening."] },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(post: BlogPost) {
  return blogPosts.filter((item) => item.slug !== post.slug).sort((a) => a.category === post.category ? -1 : 1).slice(0, 3);
}
