import type { Thing, WithContext } from "schema-dts";

interface ProductOffer {
  name: string;
  description: string;
  price: string;
  billingPeriod?: string;
}

export function generateProductSchemas(
  url: string,
  appName: string,
  offers: ProductOffer[],
  logoUrl?: string
): WithContext<Thing>[] {
  return offers.map((offer, index) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product-${index}`,
    name: `${appName} ${offer.name}`,
    description: offer.description,
    image: logoUrl || `${url}/logo.png`,
    brand: {
      "@type": "Brand",
      name: appName,
    },
    offers: {
      "@type": "Offer",
      price: offer.price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2026-12-31",
      url: `${url}#pricing`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "100",
      bestRating: "5",
      worstRating: "1",
    },
    isRelatedTo: {
      "@type": "MobileApplication",
      "@id": `${url}#mobileapp`,
    },
  }));
}
