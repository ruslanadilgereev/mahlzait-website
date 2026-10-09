import {
  adsLabel,
  featureLabel,
  formatRatingCount,
  formatStars,
  freeTierLabel,
  getAppRating,
  priceSummary,
  type CalorieApp,
} from "../../data/calorieApps";

interface Props {
  apps: CalorieApp[];
  /** Zeile hervorheben, z. B. die App, zu der Alternativen gesucht werden. */
  highlightSlug?: string;
  /** Kennzeichnet Mahlzait in der Tabelle als eigene App. */
  markOwnApp?: boolean;
  caption?: string;
}

function AppComparisonTable({
  apps,
  highlightSlug,
  markOwnApp = true,
  caption,
}: Props) {
  return (
    <>
      <p className="text-xs opacity-60 mb-2 md:hidden">
        Tabelle seitlich wischen, um alle Spalten zu sehen.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-base-300">
        <table className="table table-zebra table-sm w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              <th scope="col">App</th>
              <th scope="col">App Store</th>
              <th scope="col">Gratis nutzbar</th>
              <th scope="col">Werbung gratis</th>
              <th scope="col">Barcode</th>
              <th scope="col">Foto-Erkennung</th>
              <th scope="col">Deutsch</th>
              <th scope="col">Abo-Preis</th>
              <th scope="col">Firmensitz</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => {
              const rating = getAppRating(app);
              const highlighted = app.slug === highlightSlug;
              return (
                <tr
                  key={app.slug}
                  className={highlighted ? "font-semibold" : undefined}
                >
                  <th scope="row" className="whitespace-nowrap">
                    {app.name}
                    {markOwnApp && app.slug === "mahlzait" && (
                      <span className="badge badge-primary badge-sm mt-1 flex w-fit">
                        unsere App
                      </span>
                    )}
                  </th>
                  <td className="whitespace-nowrap">
                    {rating ? (
                      <>
                        {formatStars(rating)}
                        <span className="block text-xs opacity-60">
                          {formatRatingCount(rating)}
                        </span>
                      </>
                    ) : (
                      "Keine Angabe"
                    )}
                  </td>
                  <td>{freeTierLabel[app.freeTier]}</td>
                  <td>{adsLabel(app)}</td>
                  <td>{featureLabel[app.barcode]}</td>
                  <td>{featureLabel[app.photo]}</td>
                  <td>{app.germanUi ? "Ja" : "Nein"}</td>
                  <td>{priceSummary(app)}</td>
                  {/* Nur das Land, die Stadt steht in der App-Karte. */}
                  <td>{app.seat.split(", ").pop()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AppComparisonTable;
