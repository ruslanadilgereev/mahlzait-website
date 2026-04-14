/**
 * Reusable author byline component for blog articles & content pages.
 * Shows author name (linked to /team), publish date, optional update date,
 * and — if provided — a "Fachlich geprüft von ..." reviewer line (E-E-A-T).
 */

interface Reviewer {
  name: string;
  credentials: string;
  url?: string;
  reviewedAt?: string;
}

interface AuthorBylineProps {
  publishedAt?: string;
  updatedAt?: string;
  readingTime?: number;
  reviewer?: Reviewer;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AuthorByline({
  publishedAt,
  updatedAt,
  readingTime,
  reviewer,
}: AuthorBylineProps) {
  return (
    <div className="flex flex-col gap-1 text-sm opacity-80 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Von{" "}
          <a href="/team" className="font-medium text-primary hover:underline">
            Ruslan Adilgereev
          </a>
        </span>
        {publishedAt && (
          <>
            <span aria-hidden="true">·</span>
            <span>{formatDate(publishedAt)}</span>
          </>
        )}
        {updatedAt && (
          <>
            <span aria-hidden="true">·</span>
            <span>Aktualisiert: {formatDate(updatedAt)}</span>
          </>
        )}
        {readingTime && (
          <>
            <span aria-hidden="true">·</span>
            <span>{readingTime} Min. Lesezeit</span>
          </>
        )}
      </div>
      {reviewer && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            Fachlich geprüft
          </span>
          <span>
            von{" "}
            {reviewer.url ? (
              <a
                href={reviewer.url}
                className="font-medium hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                {reviewer.name}
              </a>
            ) : (
              <span className="font-medium">{reviewer.name}</span>
            )}
            , {reviewer.credentials}
          </span>
          {reviewer.reviewedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>Stand: {formatDate(reviewer.reviewedAt)}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
