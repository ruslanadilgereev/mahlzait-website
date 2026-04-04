import { useState, useCallback, useRef } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import AuthorByline from "@components/AuthorByline";
import PlanForm, { type UserData, type PlanType } from "@modules/essensplan/_components/PlanForm";
import StreamingLoader from "@modules/essensplan/_components/StreamingLoader";
import MealPlanResult, { type MealDay, type MealPlanSummary } from "@modules/essensplan/_components/MealPlanResult";
import TrainingPlanResult, { type TrainingDay, type TrainingPlanSummary } from "@modules/essensplan/_components/TrainingPlanResult";

interface Props {
  config: TemplateConfig;
}

function TrainingsplanPage({ config }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [currentPlanType, setCurrentPlanType] = useState<PlanType>("training");
  const [error, setError] = useState<string | null>(null);

  const [mealSummary, setMealSummary] = useState<MealPlanSummary | null>(null);
  const [mealDays, setMealDays] = useState<MealDay[]>([]);
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
                  msg.planType === "training"
                    ? "Dein Trainingsplan wird erstellt..."
                    : "Dein Essensplan wird erstellt..."
                );
                break;
              case "summary":
                if (msg.planType === "meal") {
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
                break;
              case "done":
                setLoadingMessage("");
                break;
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasResults = trainingDays.length > 0 || mealDays.length > 0;

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">KI-Generator</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Trainingsplan erstellen mit KI
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Dein individueller Wochentrainingsplan — erstellt von künstlicher Intelligenz.
              Passend zu deinem Level, Equipment und Zeitbudget.
            </p>
          </header>

          {/* Form */}
          {!showResults && (
            <PlanForm
              defaultPlanType="training"
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
                {trainingDays.length > 0 && (
                  <TrainingPlanResult summary={trainingSummary} days={trainingDays} />
                )}

                {mealDays.length > 0 && (
                  <MealPlanResult summary={mealSummary} days={mealDays} />
                )}

                {isLoading && hasResults && (
                  <div className="text-center py-4">
                    <span className="loading loading-spinner loading-md text-primary" />
                    <p className="text-sm opacity-60 mt-2">{loadingMessage}</p>
                  </div>
                )}

                {!isLoading && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button className="btn btn-outline gap-2" onClick={() => window.print()}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                        </svg>
                        Plan drucken
                      </button>
                      <button
                        className="btn btn-primary gap-2"
                        onClick={() => { setShowResults(false); setTrainingDays([]); setTrainingSummary(null); setMealDays([]); setMealSummary(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      >
                        Neuen Plan generieren
                      </button>
                    </div>

                    {!mealDays.length && (
                      <div className="card bg-primary/5 border border-primary/20">
                        <div className="card-body py-4 items-center text-center">
                          <p className="font-semibold">Passenden Essensplan dazu?</p>
                          <a href="/essensplan-erstellen" className="btn btn-primary btn-sm mt-1">
                            Essensplan erstellen &rarr;
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

        <section className="py-12 bg-base-200">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2>Warum ein strukturierter Trainingsplan wichtig ist</h2>
            <p>
              Ohne Plan trainierst du nach Gefühl — und das bedeutet oft: immer die gleichen Übungen, keine Progression und irgendwann ein Plateau. Ein guter Trainingsplan sorgt für <strong>systematische Progression</strong>, ausgewogene Muskelbelastung und genügend Regeneration.
            </p>
            <p>
              Eine Meta-Analyse von Schoenfeld et al. (2017, <em>Journal of Strength and Conditioning Research</em>) zeigt: Trainierte Personen mit strukturiertem Plan erzielen <strong>signifikant mehr Kraftzuwachs und Muskelwachstum</strong> als solche ohne Plan. Der Schlüssel liegt in der progressiven Überlastung — und die funktioniert nur mit Tracking.
            </p>

            <h2>Wie funktioniert der KI-Trainingsplan Generator?</h2>
            <p>Unser Generator erstellt deinen Plan in drei Schritten:</p>
            <ol>
              <li><strong>Profil erfassen:</strong> Dein Erfahrungslevel, verfügbares Equipment, Trainingsfrequenz und Zeitbudget bestimmen den Rahmen.</li>
              <li><strong>Split-Typ wählen:</strong> Die KI wählt den optimalen Split basierend auf deiner Frequenz und deinem Level — z.B. Ganzkörper für Anfänger (3x/Woche), Push/Pull/Legs für Fortgeschrittene (4-6x/Woche).</li>
              <li><strong>Übungen zuweisen:</strong> Passende Übungen mit Sätzen, Wiederholungen, Pausen und Progressionshinweisen. Inkl. Warm-Up und Cool-Down für jeden Trainingstag.</li>
            </ol>

            <h2>Trainingsplan für Anfänger vs. Fortgeschrittene</h2>
            <div className="not-prose grid gap-4 md:grid-cols-2 my-6">
              <div className="card bg-base-100 shadow border border-success/30">
                <div className="card-body">
                  <h3 className="card-title text-success">Anfänger (0-6 Monate)</h3>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Frequenz:</strong> 3x pro Woche (Ganzkörper)</li>
                    <li><strong>Fokus:</strong> Grundübungen lernen, Technik perfektionieren</li>
                    <li><strong>Progression:</strong> Gewicht +2,5kg alle 1-2 Wochen</li>
                    <li><strong>Sätze:</strong> 2-3 pro Übung</li>
                    <li><strong>Regeneration:</strong> 48h zwischen Trainingstagen</li>
                  </ul>
                </div>
              </div>
              <div className="card bg-base-100 shadow border border-info/30">
                <div className="card-body">
                  <h3 className="card-title text-info">Fortgeschritten (6+ Monate)</h3>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Frequenz:</strong> 4-6x pro Woche (Split)</li>
                    <li><strong>Fokus:</strong> Muskelgruppen isoliert, Volumen steigern</li>
                    <li><strong>Progression:</strong> Gewicht +1-2,5kg alle 2-4 Wochen</li>
                    <li><strong>Sätze:</strong> 3-5 pro Übung</li>
                    <li><strong>Regeneration:</strong> 72h pro Muskelgruppe</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2>3 Beispiel-Trainingspläne</h2>

            <h3>Beispiel 1: Ganzkörper — Anfänger, 3x/Woche, Gym</h3>
            <div className="not-prose overflow-x-auto my-4">
              <table className="table table-sm bg-base-100">
                <thead><tr><th>Übung</th><th>Sätze</th><th>Wdh.</th><th>Pause</th></tr></thead>
                <tbody>
                  <tr><td>Kniebeuge</td><td>3</td><td>8-10</td><td>90s</td></tr>
                  <tr><td>Bankdrücken</td><td>3</td><td>8-10</td><td>90s</td></tr>
                  <tr><td>Rudern am Kabelzug</td><td>3</td><td>10-12</td><td>60s</td></tr>
                  <tr><td>Schulterdrücken</td><td>2</td><td>10-12</td><td>60s</td></tr>
                  <tr><td>Beinpresse</td><td>2</td><td>12-15</td><td>60s</td></tr>
                  <tr><td>Plank</td><td>3</td><td>30-45s</td><td>45s</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Beispiel 2: Push/Pull/Legs — Fortgeschritten, 6x/Woche</h3>
            <div className="not-prose overflow-x-auto my-4">
              <table className="table table-sm bg-base-100">
                <thead><tr><th>Tag</th><th>Fokus</th><th>Übungen</th><th>Dauer</th></tr></thead>
                <tbody>
                  <tr><td>Mo</td><td>Push (Brust, Schulter, Trizeps)</td><td>5-6 Übungen</td><td>~60 min</td></tr>
                  <tr><td>Di</td><td>Pull (Rücken, Bizeps)</td><td>5-6 Übungen</td><td>~60 min</td></tr>
                  <tr><td>Mi</td><td>Legs (Beine, Core)</td><td>5-6 Übungen</td><td>~60 min</td></tr>
                  <tr><td>Do</td><td>Push (Variationen)</td><td>5-6 Übungen</td><td>~60 min</td></tr>
                  <tr><td>Fr</td><td>Pull (Variationen)</td><td>5-6 Übungen</td><td>~60 min</td></tr>
                  <tr><td>Sa</td><td>Legs (Variationen)</td><td>5-6 Übungen</td><td>~60 min</td></tr>
                  <tr><td>So</td><td colSpan={3}>Ruhetag — aktive Regeneration</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Beispiel 3: Upper/Lower — 4x/Woche, Home</h3>
            <div className="not-prose overflow-x-auto my-4">
              <table className="table table-sm bg-base-100">
                <thead><tr><th>Tag</th><th>Fokus</th><th>Übungen</th><th>Dauer</th></tr></thead>
                <tbody>
                  <tr><td>Mo</td><td>Upper Body</td><td>Liegestütze, Dips, Kurzhanteln</td><td>~45 min</td></tr>
                  <tr><td>Di</td><td>Lower Body</td><td>Kniebeugen, Ausfallschritte, Rumänisches Kreuzheben</td><td>~45 min</td></tr>
                  <tr><td>Mi</td><td colSpan={3}>Ruhetag</td></tr>
                  <tr><td>Do</td><td>Upper Body (Variationen)</td><td>Klimmzüge, Schulterdrücken, Rudern</td><td>~45 min</td></tr>
                  <tr><td>Fr</td><td>Lower Body (Variationen)</td><td>Sumo-Kniebeugen, Hip Thrusts, Wadenheben</td><td>~45 min</td></tr>
                  <tr><td>Sa-So</td><td colSpan={3}>Ruhetage</td></tr>
                </tbody>
              </table>
            </div>

            <h2>Progressive Overload und Periodisierung</h2>
            <p>
              <strong>Progressive Overload</strong> ist das wichtigste Prinzip im Krafttraining: Du musst den Trainingsreiz über Zeit steigern, damit Muskeln wachsen. Das geht über mehr Gewicht, mehr Wiederholungen, mehr Sätze oder weniger Pause.
            </p>
            <p>
              Unser Generator gibt dir für jede Übung <strong>Progressionshinweise</strong> — z.B. "Gewicht alle 2 Wochen um 2,5kg steigern" oder "Wenn du 3x12 schaffst, erhöhe das Gewicht."
            </p>
            <p>
              <strong>Periodisierung</strong> bedeutet, dass du deinen Plan alle 4-6 Wochen anpasst. Generiere einfach einen neuen Plan mit leicht angepassten Parametern (z.B. höheres Level, mehr Trainingstage).
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Häufige Fragen zum Trainingsplan Generator</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                { q: "Ist der Trainingsplan Generator kostenlos?", a: "Ja, komplett kostenlos. Bis zu 3 Pläne pro Stunde ohne Anmeldung oder Abo." },
                { q: "Welches Erfahrungslevel soll ich wählen?", a: "Anfänger: Weniger als 6 Monate regelmäßiges Training. Fortgeschritten: 6 Monate bis 2 Jahre. Profi: Über 2 Jahre mit solider Technik in Grundübungen." },
                { q: "Was bedeutet 'Split-Typ'?", a: "Der Split bestimmt, wie Muskelgruppen über die Woche verteilt werden. Ganzkörper = alle Muskeln pro Session. Push/Pull/Legs = aufgeteilt nach Drück-, Zug- und Beinübungen. Upper/Lower = Ober- und Unterkörper abwechselnd." },
                { q: "Kann ich nur mit Bodyweight trainieren?", a: "Ja! Wähle 'Bodyweight' als Equipment und die KI erstellt einen Plan nur mit Eigengewichtsübungen wie Liegestütze, Klimmzüge, Dips und Kniebeugen." },
                { q: "Wie oft sollte ich den Plan wechseln?", a: "Alle 4-6 Wochen. Dein Körper gewöhnt sich an den Trainingsreiz, daher ist regelmäßige Variation wichtig. Generiere einfach einen neuen Plan mit aktualisierten Parametern." },
                { q: "Berücksichtigt der Plan Aufwärmen?", a: "Ja, jeder Trainingstag enthält ein spezifisches Warm-Up und Cool-Down. Das Aufwärmen ist auf die Übungen des Tages abgestimmt." },
                { q: "Kann ich auch einen Essensplan dazu erstellen?", a: "Ja! In Schritt 3 kannst du einen Essensplan zusätzlich aktivieren. Die Makros werden automatisch auf dein Trainingsziel abgestimmt." },
                { q: "Was mache ich an Ruhetagen?", a: "Ruhetage sind für Regeneration. Leichte Aktivität wie Spazierengehen, Stretching oder Yoga ist ideal. Schweres Training an Ruhetagen verhindert optimale Erholung." },
                { q: "Wie viele Tage pro Woche sind optimal?", a: "Anfänger: 3x. Fortgeschrittene: 4-5x. Profis: 5-6x. Mehr ist nicht automatisch besser — Regeneration ist entscheidend für Muskelwachstum." },
                { q: "Werden meine Daten gespeichert?", a: "Nein, keine Daten werden gespeichert. Der Plan existiert nur in deinem Browser bis du die Seite verlässt." },
              ].map((item, i) => (
                <div key={i} className="collapse collapse-arrow bg-base-100 border border-base-300">
                  <input type="radio" name="faq-training" />
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Tracke dein Training mit Mahlzait</h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Erstelle deinen Trainingsplan hier und tracke deine Ernährung in der App.
              Kalorien und Makros per Foto, Barcode oder Text loggen — für maximale Ergebnisse.
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
              <a href="/essensplan-erstellen" className="btn btn-primary">Essensplan erstellen</a>
              <a href="/kalorienverbrauch-rechner" className="btn btn-outline">Kalorienverbrauch Rechner</a>
              <a href="/protein-bedarf-rechner" className="btn btn-outline">Proteinbedarf Rechner</a>
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">Kalorienbedarf berechnen</a>
              <a href="/makros-berechnen" className="btn btn-outline">Makros berechnen</a>
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

export default TrainingsplanPage;
