import { useState, useCallback, useRef } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import AuthorByline from "@components/AuthorByline";
import PlanForm, { type UserData, type PlanType } from "./_components/PlanForm";
import StreamingLoader from "./_components/StreamingLoader";
import MealPlanResult, { type MealDay, type MealPlanSummary } from "./_components/MealPlanResult";
import TrainingPlanResult, { type TrainingDay, type TrainingPlanSummary } from "./_components/TrainingPlanResult";
import { openPrintWindow } from "./_components/printPlan";

function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", name, params);
  }
}

interface Props {
  config: TemplateConfig;
}

function EssensplanPage({ config }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [currentPlanType, setCurrentPlanType] = useState<PlanType>("meal");
  const [error, setError] = useState<string | null>(null);

  // Meal plan state
  const [mealSummary, setMealSummary] = useState<MealPlanSummary | null>(null);
  const [mealDays, setMealDays] = useState<MealDay[]>([]);

  // Training plan state
  const [trainingSummary, setTrainingSummary] = useState<TrainingPlanSummary | null>(null);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);

  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async (userData: UserData, planType: PlanType) => {
    setIsLoading(true);
    setError(null);
    setShowResults(false);
    setMealSummary(null);
    setMealDays([]);
    setTrainingSummary(null);
    setTrainingDays([]);
    setCurrentPlanType(planType);
    setLoadingMessage("Dein Plan wird vorbereitet...");
    trackEvent("plan_generate_start", { plan_type: planType, page: "essensplan", goal: userData.goal });

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: planType, userData }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg = err?.message || err?.error || `Server-Fehler ${res.status}`;
        throw new Error(res.status === 404
          ? "API-Endpoint nicht gefunden. Nutze 'vercel dev' statt 'pnpm dev' für lokale Tests."
          : msg);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Streaming nicht unterstützt");

      const decoder = new TextDecoder();
      let buffer = "";

      setShowResults(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const msg = JSON.parse(line.slice(6));

            switch (msg.event) {
              case "start":
                setLoadingMessage(
                  msg.planType === "meal"
                    ? "Dein Essensplan wird erstellt..."
                    : "Dein Trainingsplan wird erstellt..."
                );
                break;
              case "summary":
                if (msg.planType === "meal") {
                  // API sends { summary: {...}, tips, disclaimer } — flatten it
                  const s = msg.data.summary || msg.data;
                  setMealSummary({ ...s, tips: msg.data.tips, disclaimer: msg.data.disclaimer });
                }
                if (msg.planType === "training") {
                  const s = msg.data.summary || msg.data;
                  setTrainingSummary({ ...s, tips: msg.data.tips, disclaimer: msg.data.disclaimer, progressionPlan: msg.data.progressionPlan });
                }
                break;
              case "day":
                if (msg.planType === "meal") {
                  setMealDays((prev) => [...prev, msg.data]);
                  setLoadingMessage(`Essensplan: ${msg.data.day} erstellt`);
                }
                if (msg.planType === "training") {
                  setTrainingDays((prev) => [...prev, msg.data]);
                  setLoadingMessage(`Trainingsplan: ${msg.data.day} erstellt`);
                }
                break;
              case "error":
                setError(msg.message || "Ein Fehler ist aufgetreten");
                trackEvent("plan_generate_error", { plan_type: currentPlanType, page: "essensplan", error: msg.message });
                break;
              case "done":
                setLoadingMessage("");
                trackEvent("plan_generate_complete", { plan_type: currentPlanType, page: "essensplan" });
                break;
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasResults = mealDays.length > 0 || trainingDays.length > 0;

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">KI-Generator</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Essensplan erstellen mit KI
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Dein persönlicher 7-Tage-Ernährungsplan — in Sekunden erstellt von künstlicher Intelligenz.
              Abgestimmt auf deine Kalorien, Makros, Ernährungsform und Vorlieben.
            </p>
          </header>

          {/* Form */}
          {!showResults && (
            <PlanForm
              defaultPlanType="meal"
              onSubmit={handleGenerate}
              isLoading={isLoading}
            />
          )}

          {/* Loading */}
          {isLoading && !hasResults && (
            <StreamingLoader message={loadingMessage} planType={currentPlanType} />
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-error max-w-2xl mx-auto mt-6">
              <p>{error}</p>
              <button className="btn btn-sm btn-ghost" onClick={() => { setError(null); setShowResults(false); }}>
                Erneut versuchen
              </button>
            </div>
          )}

          {/* Results */}
          <div ref={resultsRef}>
            {showResults && hasResults && (
              <div className="space-y-10 mt-8 max-w-2xl mx-auto">
                {mealDays.length > 0 && (
                  <MealPlanResult summary={mealSummary} days={mealDays} />
                )}

                {trainingDays.length > 0 && (
                  <TrainingPlanResult summary={trainingSummary} days={trainingDays} />
                )}

                {/* Loading remaining */}
                {isLoading && hasResults && (
                  <div className="text-center py-4">
                    <span className="loading loading-spinner loading-md text-primary" />
                    <p className="text-sm opacity-60 mt-2">{loadingMessage}</p>
                  </div>
                )}

                {/* Actions after generation */}
                {!isLoading && (
                  <div className="space-y-4">
                    {/* Print */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        className="btn btn-outline gap-2"
                        onClick={() => { trackEvent("plan_print", { page: "essensplan" }); openPrintWindow(mealSummary, mealDays, trainingSummary, trainingDays); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                        </svg>
                        Plan drucken
                      </button>
                      <button
                        className="btn btn-primary gap-2"
                        onClick={() => { setShowResults(false); setMealDays([]); setMealSummary(null); setTrainingDays([]); setTrainingSummary(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      >
                        Neuen Plan generieren
                      </button>
                    </div>

                    {/* Cross-link to Trainingsplan */}
                    {!trainingDays.length && (
                      <div className="card bg-primary/5 border border-primary/20">
                        <div className="card-body py-4 items-center text-center">
                          <p className="font-semibold">Passenden Trainingsplan dazu?</p>
                          <a href="/trainingsplan-erstellen" className="btn btn-primary btn-sm mt-1">
                            Trainingsplan erstellen &rarr;
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── SEO Content ── */}

        {/* Was ist ein Essensplan */}
        <section className="py-12 bg-base-200">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2>Was ist ein Essensplan und warum brauchst du einen?</h2>
            <p>
              Ein Essensplan (auch Ernährungsplan oder Meal Plan) ist eine strukturierte Übersicht deiner Mahlzeiten für einen bestimmten Zeitraum — meistens eine Woche. Er legt fest, <strong>was du wann isst</strong>, und stellt sicher, dass du deine Kalorien- und Makroziele erreichst.
            </p>
            <p>
              Studien zeigen: Menschen mit einem festen Essensplan <strong>ernähren sich vielfältiger</strong>, haben eine bessere Nährstoffversorgung und erreichen ihre Gewichtsziele schneller (Ducrot et al., 2017, <em>International Journal of Behavioral Nutrition and Physical Activity</em>). Der Grund ist einfach — ohne Plan greifst du zum Nächstbesten. Mit Plan triffst du bewusste Entscheidungen.
            </p>
            <p>
              Unser KI-gestützter Generator nimmt dir die aufwendigste Arbeit ab: Er berechnet deinen Kalorienbedarf, verteilt die Makronährstoffe optimal und erstellt dir <strong>7 Tage mit konkreten Rezepten</strong> — abgestimmt auf deine Ernährungsform, Allergien und Kochzeit.
            </p>

            <h2>Wie erstellt die KI deinen Essensplan?</h2>
            <p>Der Prozess läuft in drei Schritten:</p>
            <ol>
              <li><strong>Kalorienbedarf berechnen:</strong> Auf Basis deiner Daten (Alter, Geschlecht, Größe, Gewicht, Aktivität) berechnen wir deinen Gesamtenergieumsatz (TDEE) mit der wissenschaftlich validierten Mifflin-St Jeor Formel. Je nach Ziel wird ein Defizit oder Überschuss eingeplant.</li>
              <li><strong>Makros aufteilen:</strong> Protein, Kohlenhydrate und Fett werden nach bewährten Richtlinien verteilt. Beim Abnehmen z.B. 30% Protein (für Muskelerhalt), 40% Carbs und 30% Fett.</li>
              <li><strong>Plan generieren:</strong> Die KI erstellt einen 7-Tage-Plan mit abwechslungsreichen, alltagstauglichen Rezepten, die exakt in dein Makrobudget passen. Dabei berücksichtigt sie Ernährungsform, Allergien, Budget und Kochzeit.</li>
            </ol>

            <h2>Essensplan zum Abnehmen vs. Muskelaufbau</h2>
            <div className="not-prose grid gap-4 md:grid-cols-2 my-6">
              <div className="card bg-base-100 shadow border border-success/30">
                <div className="card-body">
                  <h3 className="card-title text-success">Abnehmen</h3>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Defizit:</strong> 300-500 kcal unter TDEE</li>
                    <li><strong>Protein:</strong> Hoch (1,6-2,0g/kg) — schützt Muskelmasse</li>
                    <li><strong>Sättigung:</strong> Viel Gemüse, Ballaststoffe</li>
                    <li><strong>Tempo:</strong> 0,3-0,5 kg pro Woche</li>
                    <li><strong>Typisch:</strong> 1.500-2.000 kcal/Tag</li>
                  </ul>
                </div>
              </div>
              <div className="card bg-base-100 shadow border border-info/30">
                <div className="card-body">
                  <h3 className="card-title text-info">Muskelaufbau</h3>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Überschuss:</strong> 200-400 kcal über TDEE</li>
                    <li><strong>Protein:</strong> Hoch (1,6-2,2g/kg) — Muskelproteinsynthese</li>
                    <li><strong>Carbs:</strong> Hoch — Energie für Training</li>
                    <li><strong>Tempo:</strong> 0,25-0,5 kg pro Monat (Fortgeschritten)</li>
                    <li><strong>Typisch:</strong> 2.500-3.500 kcal/Tag</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2>3 Beispiel-Tagespläne</h2>
            <p>Hier sind drei typische Tagespläne, die unser Generator erstellen könnte:</p>

            <h3>Beispiel 1: Abnehmen, omnivor, 1.800 kcal</h3>
            <div className="not-prose overflow-x-auto my-4">
              <table className="table table-sm bg-base-100">
                <thead><tr><th>Mahlzeit</th><th>Gericht</th><th>kcal</th><th>Protein</th></tr></thead>
                <tbody>
                  <tr><td>Frühstück</td><td>Griechischer Joghurt mit Beeren & Haferflocken</td><td>380</td><td>28g</td></tr>
                  <tr><td>Mittagessen</td><td>Hähnchen-Wrap mit Salat & Hummus</td><td>520</td><td>38g</td></tr>
                  <tr><td>Snack</td><td>Apfel mit Mandelbutter</td><td>250</td><td>6g</td></tr>
                  <tr><td>Abendessen</td><td>Lachs mit Süßkartoffel & Brokkoli</td><td>650</td><td>42g</td></tr>
                  <tr className="font-bold"><td>Gesamt</td><td></td><td>1.800</td><td>114g</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Beispiel 2: Muskelaufbau, vegetarisch, 2.800 kcal</h3>
            <div className="not-prose overflow-x-auto my-4">
              <table className="table table-sm bg-base-100">
                <thead><tr><th>Mahlzeit</th><th>Gericht</th><th>kcal</th><th>Protein</th></tr></thead>
                <tbody>
                  <tr><td>Frühstück</td><td>Protein-Pancakes mit Banane & Erdnussbutter</td><td>650</td><td>35g</td></tr>
                  <tr><td>Snack</td><td>Quark mit Granola & Honig</td><td>380</td><td>30g</td></tr>
                  <tr><td>Mittagessen</td><td>Linsen-Dal mit Basmatireis & Naan</td><td>720</td><td>28g</td></tr>
                  <tr><td>Snack</td><td>Protein-Shake mit Hafermilch & Banane</td><td>350</td><td>30g</td></tr>
                  <tr><td>Abendessen</td><td>Tofu-Stir-Fry mit Reis & Erdnusssauce</td><td>700</td><td>32g</td></tr>
                  <tr className="font-bold"><td>Gesamt</td><td></td><td>2.800</td><td>155g</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Beispiel 3: Gewicht halten, vegan, 2.100 kcal</h3>
            <div className="not-prose overflow-x-auto my-4">
              <table className="table table-sm bg-base-100">
                <thead><tr><th>Mahlzeit</th><th>Gericht</th><th>kcal</th><th>Protein</th></tr></thead>
                <tbody>
                  <tr><td>Frühstück</td><td>Overnight Oats mit Chiasamen, Beeren & Kokosjoghurt</td><td>450</td><td>15g</td></tr>
                  <tr><td>Mittagessen</td><td>Buddha Bowl mit Quinoa, Kichererbsen & Tahini-Dressing</td><td>620</td><td>22g</td></tr>
                  <tr><td>Snack</td><td>Energiebällchen mit Datteln & Kakao</td><td>280</td><td>8g</td></tr>
                  <tr><td>Abendessen</td><td>Pasta mit Linsen-Bolognese & Rucola</td><td>750</td><td>28g</td></tr>
                  <tr className="font-bold"><td>Gesamt</td><td></td><td>2.100</td><td>73g</td></tr>
                </tbody>
              </table>
            </div>

            <h2>Tipps für die Umsetzung deines Essensplans</h2>
            <ul>
              <li><strong>Meal Prep am Sonntag:</strong> Koche 2-3 Gerichte vor und portioniere sie für die Woche. Das spart Zeit und verhindert spontane Fehlentscheidungen.</li>
              <li><strong>Einkaufsliste erstellen:</strong> Geh den Plan durch und notiere alle Zutaten. So kaufst du nur das, was du brauchst — das spart Geld und reduziert Food Waste.</li>
              <li><strong>Flexibel bleiben:</strong> Tausche Mahlzeiten innerhalb des Plans, wenn dir etwas nicht schmeckt. Achte nur darauf, dass die Kalorien und Makros ähnlich bleiben.</li>
              <li><strong>Mit Mahlzait tracken:</strong> Nutze die App, um deine tatsächliche Aufnahme zu tracken. So siehst du, ob Plan und Realität übereinstimmen.</li>
              <li><strong>Wasser nicht vergessen:</strong> Trinke mindestens 2-3 Liter pro Tag. Oft wird Durst mit Hunger verwechselt.</li>
              <li><strong>Nicht perfekt sein müssen:</strong> 80% Planeinhaltung reicht für gute Ergebnisse. Der beste Plan ist der, an den du dich halten kannst.</li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Häufige Fragen zum Essensplan Generator</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                { q: "Ist der Essensplan Generator wirklich kostenlos?", a: "Ja, du kannst bis zu 3 Pläne pro Stunde komplett kostenlos erstellen. Es gibt keine versteckten Kosten oder Abo-Pflicht." },
                { q: "Wie genau sind die Kalorien- und Makro-Angaben?", a: "Der Kalorienbedarf wird mit der wissenschaftlich validierten Mifflin-St Jeor Formel berechnet, die bei ~70% der Personen auf ±10% genau ist. Die Makros der einzelnen Gerichte sind Richtwerte — für exaktes Tracking empfehlen wir die Mahlzait App." },
                { q: "Kann ich den Plan anpassen nachdem er generiert wurde?", a: "Du kannst jederzeit einen neuen Plan mit geänderten Präferenzen generieren. Einzelne Mahlzeiten tauschen kannst du, indem du auf ähnliche Alternativen mit gleichen Makros achtest." },
                { q: "Berücksichtigt der Plan meine Allergien?", a: "Ja, du kannst Laktose, Gluten, Nüsse, Soja, Ei und Fructose als Unverträglichkeiten angeben. Die KI erstellt dann nur Rezepte ohne diese Zutaten." },
                { q: "Für wen ist der Essensplan geeignet?", a: "Für alle, die ihre Ernährung strukturieren möchten — ob zum Abnehmen, Muskelaufbau oder für eine ausgewogene Ernährung. Der Generator ist nicht als medizinische Ernährungsberatung gedacht und ersetzt keine ärztliche Empfehlung bei Erkrankungen." },
                { q: "Welche Ernährungsformen werden unterstützt?", a: "Aktuell: Omnivor (alles), Vegetarisch und Vegan. Spezielle Diäten wie Keto, Paleo oder Low-FODMAP sind derzeit nicht als eigene Optionen verfügbar." },
                { q: "Wie lange dauert die Generierung?", a: "In der Regel 5-15 Sekunden. Du siehst den Fortschritt live — jeder Tag wird angezeigt, sobald er fertig ist." },
                { q: "Kann ich auch einen Trainingsplan dazu erstellen?", a: "Ja! In Schritt 3 kannst du zusätzlich einen Trainingsplan aktivieren. Alternativ nutze unseren Trainingsplan Generator für noch mehr Optionen." },
                { q: "Werden meine Daten gespeichert?", a: "Nein. Deine eingegebenen Daten werden nur für die Generierung verwendet und danach nicht gespeichert. Der generierte Plan existiert nur in deinem Browser." },
                { q: "Wie oft kann ich einen Plan erstellen?", a: "Bis zu 3 Mal pro Stunde. Danach musst du kurz warten. So stellen wir sicher, dass der Service für alle verfügbar bleibt." },
                { q: "Was unterscheidet diesen Generator von anderen?", a: "Unser Generator berechnet zuerst deinen exakten Kalorienbedarf und Makros wissenschaftlich, und gibt diese Werte dann an die KI weiter. So stimmen die Nährwerte — statt dass die KI Kalorien schätzt (was oft ungenau ist)." },
                { q: "Kann ich den Plan ausdrucken?", a: "Ja, nach der Generierung gibt es einen 'Plan drucken' Button, der eine druckfreundliche Version erstellt." },
              ].map((item, i) => (
                <div key={i} className="collapse collapse-arrow bg-base-100 border border-base-300">
                  <input type="radio" name="faq-essensplan" />
                  <div className="collapse-title font-semibold">{item.q}</div>
                  <div className="collapse-content"><p className="text-sm opacity-80">{item.a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Tracke deinen Essensplan mit Mahlzait</h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Erstelle deinen Plan hier und tracke ihn in der App. Per Foto, Barcode oder Text —
              in Sekunden weißt du, ob du im Plan liegst.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={config.appStoreLink} className="btn btn-lg bg-white text-primary hover:bg-white/90">
                iOS App laden
              </a>
              <a href={config.googlePlayLink} className="btn btn-lg bg-white text-primary hover:bg-white/90">
                Android App laden
              </a>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">Weitere Rechner & Tools</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/trainingsplan-erstellen" className="btn btn-primary">Trainingsplan erstellen</a>
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">Kalorienbedarf berechnen</a>
              <a href="/makros-berechnen" className="btn btn-outline">Makros berechnen</a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">Kaloriendefizit berechnen</a>
              <a href="/protein-bedarf-rechner" className="btn btn-outline">Proteinbedarf Rechner</a>
              <a href="/rechner" className="btn btn-outline">Alle Rechner</a>
            </div>
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default EssensplanPage;
