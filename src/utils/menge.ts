// Mengen aus den Lebensmitteldaten für sichtbaren Text im deutschen Format:
// Dezimalkomma, Leerzeichen vor der Einheit, ganze Zahlen ohne Nachkommastellen,
// z. B. 43,75 g, 350 g, 8,4 g. JSON-LD bleibt maschinenlesbar und nutzt das nicht.
// Geprüft in test/gewichte-anzeige.test.mjs.

export function zahlDe(wert: number, stellen = 2): string {
  return wert.toLocaleString("de-DE", { maximumFractionDigits: stellen });
}

export function menge(wert: number, einheit: "g" | "ml" = "g", stellen = 2): string {
  return `${zahlDe(wert, stellen)} ${einheit}`;
}
