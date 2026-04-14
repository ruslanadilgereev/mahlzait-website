/**
 * Sichtbare Breadcrumb-Navigation + BreadcrumbList JSON-LD.
 *
 * Wird in Calculator-Modulen zwischen Navbar und Hero gerendert.
 * Das JSON-LD wird server-side (bzw. beim SSR der React-Island)
 * in den HTML-Output geschrieben und ist damit für Google crawlbar.
 */

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface Props {
  items: BreadcrumbItem[];
}

const SITE_URL = "https://www.mahlzait.de";

function Breadcrumbs({ items }: Props) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <>
      <nav
        className="text-sm breadcrumbs max-w-screen-lg mx-auto px-4 pt-4"
        aria-label="Breadcrumb"
      >
        <ul>
          {items.map((item, idx) =>
            idx === items.length - 1 ? (
              <li key={idx} className="opacity-70" aria-current="page">
                {item.name}
              </li>
            ) : (
              <li key={idx}>
                <a href={item.url}>{item.name}</a>
              </li>
            )
          )}
        </ul>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}

export default Breadcrumbs;
