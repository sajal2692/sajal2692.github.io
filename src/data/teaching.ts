/**
 * The single source of truth for teaching credentials.
 *
 * Course titles, formats and dates were duplicated between the homepage and
 * the About page, which is how the homepage came to advertise a live session
 * that had already run. Everything that renders a course — homepage, /teaching,
 * About — reads from here, and dates are filtered against build time, so an
 * expired session disappears on the next deploy instead of sitting there.
 *
 * Sessions are stored as ISO 8601 with an explicit offset. O'Reilly schedules
 * in Pacific time; writing the offset out means the comparison is unambiguous
 * and no timezone maths happens at render.
 */

export interface CourseSession {
  /** Start of the live session, ISO 8601 with offset. */
  start: string;
  /** End, same format — used for the "9:00am-1:00pm" range on /teaching. */
  end: string;
}

export interface Course {
  title: string;
  url: string;
  /** On-demand courses are always available; live ones have dated sessions. */
  format: "on-demand" | "live";
  /** One line: what the course covers. Used on cards and on /teaching. */
  summary: string;
  /** Runtime for on-demand courses, e.g. "3 hours". */
  duration?: string;
  /** Scheduled sittings for live courses. Past ones are filtered at build. */
  sessions?: CourseSession[];
}

export interface Lecture {
  venue: string;
  course: string;
  title: string;
  year: number;
}

export const COURSES: Course[] = [
  {
    title: "Building AI Agents with LangGraph",
    url: "https://learning.oreilly.com/course/building-ai-agents/0642572077884/",
    format: "on-demand",
    summary:
      "Agent concepts, multi-agent architectures, and the design patterns that hold up in production.",
    duration: "3 hours",
  },
  {
    title: "Agentic RAG with LangGraph",
    url: "https://www.oreilly.com/live-events/agentic-rag-with-langgraph/0642572176174/",
    format: "live",
    summary:
      "Building retrieval systems that reason about what they retrieve, using agentic workflows.",
    sessions: [
      { start: "2026-07-09T21:00:00-07:00", end: "2026-07-10T01:00:00-07:00" },
      { start: "2026-08-27T09:00:00-07:00", end: "2026-08-27T13:00:00-07:00" },
    ],
  },
  {
    title: "Building Integrated AI Agents with OpenClaw",
    url: "https://learning.oreilly.com/live-events/building-integrated-ai-agents-with-openclaw/0642572350437/0642572350420/",
    format: "live",
    summary:
      "OpenClaw's architecture, deployment, and the proactive automation it makes possible.",
    sessions: [
      { start: "2026-08-25T08:00:00-07:00", end: "2026-08-25T12:00:00-07:00" },
    ],
  },
  {
    title: "Getting Started with Claude Agent SDK",
    url: "https://learning.oreilly.com/live-events/getting-started-with-claude-agent-sdk/0642572273255/0642572273248/",
    format: "live",
    summary:
      "Building agents on the Claude Agent SDK, from first tool call to a working harness.",
    sessions: [
      { start: "2026-08-26T09:00:00-07:00", end: "2026-08-26T13:00:00-07:00" },
    ],
  },
];

/** Guest lectures, newest first. Two years running is the signal worth showing. */
export const LECTURES: Lecture[] = [
  {
    venue: "Yale University",
    course: "MGT 899: Generative AI & Entrepreneurship",
    title: "From Agentic Workflows to Agent Harness",
    year: 2026,
  },
  {
    venue: "Yale University",
    course: "MGT 899: Generative AI & Entrepreneurship",
    title: "Building Agentic Systems with LangGraph",
    year: 2025,
  },
];

/**
 * Sessions still ahead of `now`, soonest first. Called at build time, so "now"
 * is the deploy — the site rebuilds on every push, which is close enough for a
 * schedule that changes a few times a year.
 */
export function upcomingSessions(
  course: Course,
  now: Date = new Date()
): CourseSession[] {
  return (course.sessions ?? [])
    .filter(session => new Date(session.start) > now)
    .sort((a, b) => a.start.localeCompare(b.start));
}

/** The next date to advertise for a course, or null for on-demand/expired. */
export function nextSession(
  course: Course,
  now: Date = new Date()
): CourseSession | null {
  return upcomingSessions(course, now)[0] ?? null;
}

/**
 * Courses in the order a reader can actually attend them: whatever is happening
 * soonest first, then everything without a date.
 *
 * The undated tail is on-demand courses — always available, so nothing about
 * them is urgent — plus any live course whose sittings have all run, which
 * would otherwise sort unpredictably against dated ones. Within that tail the
 * declared order in COURSES is preserved.
 */
export function coursesByNextSession(
  courses: Course[] = COURSES,
  now: Date = new Date()
): Course[] {
  return courses
    .map((course, index) => ({ course, index, next: nextSession(course, now) }))
    .sort((a, b) => {
      if (a.next && b.next) return a.next.start.localeCompare(b.next.start);
      if (a.next) return -1;
      if (b.next) return 1;
      return a.index - b.index;
    })
    .map(entry => entry.course);
}

/**
 * Session dates render in Pacific time, not UTC and not the visitor's zone,
 * because that is the date O'Reilly's own page shows — a reader comparing the
 * two should not see a mismatch. It matters: the 9:00pm sitting is already the
 * next day in UTC, so a UTC-pinned format would advertise the wrong date.
 *
 * This is deliberately not `formatPostDate`, which pins UTC for the opposite
 * reason (post dates are authored as UTC midnight).
 */
export function formatSessionDate(session: CourseSession): string {
  return new Date(session.start).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    timeZone: "America/Los_Angeles",
  });
}
