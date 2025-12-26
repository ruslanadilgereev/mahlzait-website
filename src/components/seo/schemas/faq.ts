import type { Thing, WithContext } from "schema-dts";

interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(
  url: string,
  faqs: FAQItem[]
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

