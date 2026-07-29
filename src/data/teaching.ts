/**
 * The single source of truth for teaching credentials.
 *
 * Course titles, formats and dates were duplicated between the homepage and
 * the About page, which is how the homepage came to advertise a live session
 * that had already run. The homepage and /teaching both read from here, and
 * dates are filtered against build time, so an expired session disappears on
 * the next deploy instead of sitting there.
 *
 * About still hardcodes its own copy of the course list. That is deliberate for
 * now — About is being rewritten wholesale in the content epic — but until it
 * reads from this file the drift this module exists to prevent is only half
 * prevented.
 *
 * Sessions are stored as ISO 8601 with an explicit offset. O'Reilly schedules
 * in Pacific time; writing the offset out means the comparison is unambiguous
 * and no timezone maths happens at render.
 */

export interface CourseSession {
  /** Start of the live session, ISO 8601 with offset. */
  start: string;
  /** End, same format and offset. Renders the "9:00am-1:00pm" range. */
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

/**
 * An invited talk inside someone else's class — the opposite shape to a Course,
 * which is Sajal's own material, bookable and forward-looking. A lecture has
 * already happened, has no URL to enrol through, and does not repeat.
 */
export interface Lecture {
  venue: string;
  /**
   * The host's course the talk was given inside — Yale's MGT 899, not one of
   * COURSES. Named `hostCourse` because a bare `course` in this module reads as
   * the other kind.
   */
  hostCourse: string;
  /** The talk's own title. */
  title: string;
  year: number;
  /** What it covered. Optional so a bare listing is still valid. */
  summary?: string;
}

/**
 * Long-running mentoring, which is neither a course nor a talk: no URL, no
 * single date, and its weight comes from a quantity rather than a schedule.
 */
export interface Mentorship {
  org: string;
  /** Inclusive range, e.g. "2017-2023". */
  years: string;
  /** One line carrying the number that makes it a receipt. */
  summary: string;
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
    hostCourse: "MGT 899: Generative AI & Entrepreneurship",
    title: "From Agentic Workflows to Agent Harness",
    year: 2026,
    summary:
      "The architectural shift from agentic workflows to agent harnesses, and what it changes about building AI applications.",
  },
  {
    venue: "Yale University",
    hostCourse: "MGT 899: Generative AI & Entrepreneurship",
    title: "Building Agentic Systems with LangGraph",
    year: 2025,
    summary:
      "How entrepreneurs can use graph-based AI workflows to build agentic products.",
  },
];

/** Mentoring, oldest engagement last. Community proof, not the headline. */
export const MENTORSHIP: Mentorship[] = [
  {
    org: "Udacity",
    years: "2017-2023",
    summary:
      "Reviewed more than 1,000 projects across the Machine Learning and Data Science programs, rated A+ by Udacity's internal audit.",
  },
  {
    org: "University of Melbourne",
    years: "2020-2023",
    summary:
      "STEM Mentorship Program: career and technical guidance for students moving into technology and AI.",
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

const PACIFIC_TIME = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Los_Angeles",
});

/**
 * The full "27 Aug, 9:00 AM - 1:00 PM PT" line for a live sitting. This is what
 * `CourseSession.end` is stored for; the compact card shows only the date.
 *
 * The zone label is spelled out because a reader in another timezone otherwise
 * has no way to know which 9:00 AM is meant — and one sitting runs 9:00 PM to
 * 1:00 AM, so the times alone can span two calendar days.
 */
export function formatSessionRange(session: CourseSession): string {
  return `${formatSessionDate(session)}, ${PACIFIC_TIME.format(
    new Date(session.start)
  )} - ${PACIFIC_TIME.format(new Date(session.end))} PT`;
}
