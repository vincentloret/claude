import { google } from "googleapis";
import { prisma } from "./prisma";

const GOOGLE_CONNECTION_ID = "singleton";

// Lecture/écriture des agendas des lieux + identité du compte connecté.
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
];

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

export function getGoogleAuthUrl(): string {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

/** Échange le code d'autorisation contre des tokens et enregistre la connexion Google familiale. */
export async function connectGoogleAccount(code: string): Promise<void> {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
    throw new Error(
      "Réponse Google incomplète (pas de refresh_token — révoque l'accès existant sur https://myaccount.google.com/permissions et reconnecte-toi).",
    );
  }

  client.setCredentials(tokens);
  const { data: userinfo } = await google.oauth2({ auth: client, version: "v2" }).userinfo.get();

  await prisma.googleConnection.upsert({
    where: { id: GOOGLE_CONNECTION_ID },
    create: {
      id: GOOGLE_CONNECTION_ID,
      email: userinfo.email ?? "inconnu",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: new Date(tokens.expiry_date),
    },
    update: {
      email: userinfo.email ?? "inconnu",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: new Date(tokens.expiry_date),
    },
  });
}

export async function getGoogleConnection() {
  return prisma.googleConnection.findUnique({ where: { id: GOOGLE_CONNECTION_ID } });
}

/** Client OAuth2 authentifié, avec rafraîchissement automatique du token si expiré. */
export async function getAuthorizedGoogleClient() {
  const connection = await getGoogleConnection();
  if (!connection) return null;

  const client = createOAuth2Client();
  client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: connection.expiryDate.getTime(),
  });

  if (connection.expiryDate.getTime() <= Date.now()) {
    const { credentials } = await client.refreshAccessToken();
    client.setCredentials(credentials);
    if (credentials.access_token && credentials.expiry_date) {
      await prisma.googleConnection.update({
        where: { id: GOOGLE_CONNECTION_ID },
        data: {
          accessToken: credentials.access_token,
          expiryDate: new Date(credentials.expiry_date),
        },
      });
    }
  }

  return client;
}
