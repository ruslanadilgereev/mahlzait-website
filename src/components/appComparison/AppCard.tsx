import {
  appStoreUrl,
  formatRatingCount,
  formatStars,
  getAppRating,
  type CalorieApp,
} from "../../data/calorieApps";

interface Props {
  app: CalorieApp;
  /** Überschrift-Präfix, z. B. die Position in der Liste. */
  position?: number;
  /** App-spezifischer Satz, z. B. warum sie eine Alternative zu X ist. */
  reason?: string;
  /** Link zur Alternativ-Seite dieser App ausblenden (auf der Seite selbst). */
  hideAlternativeLink?: boolean;
}

function AppCard({ app, position, reason, hideAlternativeLink }: Props) {
  const rating = getAppRating(app);
  const isOwnApp = app.slug === "mahlzait";

  return (
    <article id={app.slug} className="card bg-base-200 scroll-mt-24">
      <div className="card-body gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="card-title text-xl">
            {position !== undefined && `${position}. `}
            {app.name}
            {isOwnApp && (
              <span className="badge badge-primary badge-sm">unsere App</span>
            )}
          </h3>
          {rating && (
            <span className="text-sm opacity-70">
              {formatStars(rating)} · {formatRatingCount(rating)} im App Store
            </span>
          )}
        </div>
        <p className="text-sm opacity-70">
          {app.provider}, {app.seat}
        </p>

        {reason && <p className="opacity-90">{reason}</p>}

        <p className="opacity-80">
          <span className="font-semibold">Gratis-Version: </span>
          {app.freeSummary}
        </p>
        <p className="opacity-80">
          <span className="font-semibold">Preis: </span>
          {app.priceNote}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-semibold mb-1">Stärken</h4>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              {app.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Schwächen</h4>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              {app.weaknesses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="opacity-90">
          <span className="font-semibold">Passt zu dir: </span>
          {app.bestFor}
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {app.alternativePath && !hideAlternativeLink && (
            <a href={app.alternativePath} className="link link-primary">
              {app.name}: Kosten, Kündigung und Alternativen
            </a>
          )}
          <a
            href={isOwnApp ? "/#pricing" : appStoreUrl(app)}
            className="link"
            {...(isOwnApp
              ? {}
              : {
                  target: "_blank",
                  rel: "nofollow noopener noreferrer",
                })}
          >
            {isOwnApp ? "Funktionen und Preise" : "Im App Store ansehen"}
          </a>
        </div>

        <p className="text-xs opacity-60">
          Quellen:{" "}
          {app.sources.map((source, index) => {
            const external = !source.url.startsWith("https://www.mahlzait.de");
            return (
              <span key={source.url}>
                {index > 0 && ", "}
                <a
                  href={source.url}
                  className="underline"
                  {...(external
                    ? { target: "_blank", rel: "nofollow noopener noreferrer" }
                    : {})}
                >
                  {source.label}
                </a>
              </span>
            );
          })}
        </p>
      </div>
    </article>
  );
}

export default AppCard;
