import type { Thing, WithContext } from "schema-dts";

interface ReviewItem {
  name: string;
  comment: string;
  datePublished?: string;
}

// Static dates for reviews (staggered over the past months)
const reviewDates = [
  "2025-01-15",
  "2025-01-22",
  "2025-02-03",
  "2025-02-14",
  "2025-02-21",
];

export function generateReviewSchema(
  url: string,
  reviews: ReviewItem[]
): WithContext<Thing>[] {
  return reviews.map((review, index) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "@id": `${url}#review-${index}`,
    itemReviewed: {
      "@type": "MobileApplication",
      "@id": `${url}#mobileapp`,
      name: "Mahlzait",
    },
    author: {
      "@type": "Person",
      name: review.name,
    },
    datePublished: review.datePublished || reviewDates[index % reviewDates.length],
    reviewBody: review.comment,
    reviewRating: {
      "@type": "Rating",
      ratingValue: "5",
      bestRating: "5",
      worstRating: "1",
    },
  }));
}

