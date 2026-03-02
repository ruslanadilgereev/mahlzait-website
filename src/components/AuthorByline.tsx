/**
 * Reusable author byline component for blog articles & content pages.
 * Shows author name (linked to /team), publish date, and optional update date.
 */

interface AuthorBylineProps {
  publishedAt?: string;
  updatedAt?: string;
  readingTime?: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AuthorByline({ publishedAt, updatedAt, readingTime }: AuthorBylineProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm opacity-70 mb-6">
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
  );
}
