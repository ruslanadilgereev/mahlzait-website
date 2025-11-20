import type { Thing, WithContext } from "schema-dts";

interface HowToStep {
  title: string;
  subtitle: string;
  image: string;
}

export function generateHowToSchema(
  url: string,
  name: string,
  description: string,
  steps: HowToStep[]
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}#howto`,
    name: name,
    description: description,
    totalTime: "PT5M",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.subtitle,
      image: `${url}${step.image}`,
    })),
  };
}

