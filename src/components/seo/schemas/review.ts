import type { Thing, WithContext } from "schema-dts";

interface ReviewItem {
  name: string;
  comment: string;
}

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
    reviewBody: review.comment,
    reviewRating: {
      "@type": "Rating",
      ratingValue: "5",
      bestRating: "5",
      worstRating: "1",
    },
  }));
}

