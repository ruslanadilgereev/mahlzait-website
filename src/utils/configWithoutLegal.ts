import defaultTemplateConfig from "utils/config";

// Config ohne die langen Rechtstexte. Wird die volle Config an eine React-Insel
// uebergeben, serialisiert Astro sie in das props-Attribut von <astro-island> —
// der Datenschutz-, Cookie- und AGB-Text landet dann als identischer Block im
// HTML jeder einzelnen Seite (~18KB, bei Food-Seiten fast die Haelfte des
// Dokuments). Nur /datenschutz, /cookies-policy und /nutzungsbedingungen
// rendern diese Inhalte tatsaechlich und importieren weiterhin die volle Config.
const configWithoutLegal = {
  ...defaultTemplateConfig,
  privacyPolicy: { seo: defaultTemplateConfig.privacyPolicy.seo, content: "" },
  cookiesPolicy: { seo: defaultTemplateConfig.cookiesPolicy.seo, content: "" },
  termsAndConditions: {
    seo: defaultTemplateConfig.termsAndConditions.seo,
    content: "",
  },
};

export default configWithoutLegal;
