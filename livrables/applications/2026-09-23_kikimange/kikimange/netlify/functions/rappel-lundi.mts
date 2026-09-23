import type { Config } from "@netlify/functions";

// Fonction planifiée : le lundi à 9 h et 10 h UTC (11 h à Paris en été, puis en hiver).
// Elle ne fait qu'appeler la route de l'appli, qui vérifie l'heure de Paris et envoie les rappels.
const rappelLundi = async () => {
  const base = process.env.URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.error("URL ou CRON_SECRET manquant : rappel non envoyé.");
    return;
  }
  const reponse = await fetch(`${base}/api/rappel-lundi`, { method: "POST", headers: { authorization: `Bearer ${secret}` } });
  console.log("Rappel du lundi :", reponse.status, await reponse.text());
};

export default rappelLundi;

export const config: Config = {
  schedule: "0 9,10 * * 1",
};
