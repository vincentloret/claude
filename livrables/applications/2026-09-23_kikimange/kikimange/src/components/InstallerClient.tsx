"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { BrandMark } from "./BrandMark";
import { enregistrerAbonnement } from "@/lib/actions";

type Plateforme = "iphone" | "android" | "ordinateur" | "inconnu";
type EtatNotifs = "verification" | "indisponible" | "refusees" | "actives" | "a-activer";

type EvenementInstallation = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const rien = () => () => {};

function lirePlateforme(): Plateforme {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)) return "iphone";
  if (/Android/.test(ua)) return "android";
  return "ordinateur";
}

function lireInstallee(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function nomAppareil(p: Plateforme): string {
  return p === "iphone" ? "iPhone" : p === "android" ? "Android" : "Ordinateur";
}

/** Convertit la clé publique VAPID (base64 url) au format attendu par pushManager.subscribe. */
function cleVersOctets(base64: string): Uint8Array<ArrayBuffer> {
  const rembourre = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const brut = atob(rembourre);
  const octets = new Uint8Array(new ArrayBuffer(brut.length));
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i);
  return octets;
}

function Etape({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-sm font-medium text-on-primary">{n}</span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

function Pastille({ icone, children }: { icone: string; children: React.ReactNode }) {
  return (
    <span className="mx-1 inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-0.5 text-sm font-medium">
      <Icon name={icone} size={16} />
      {children}
    </span>
  );
}

export function InstallerClient({ prenom }: { prenom: string }) {
  const plateforme = useSyncExternalStore<Plateforme>(rien, lirePlateforme, () => "inconnu");
  const installee = useSyncExternalStore(rien, lireInstallee, () => false);
  const [invite, setInvite] = useState<EvenementInstallation | null>(null);
  const [notifs, setNotifs] = useState<EtatNotifs>("verification");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    function capter(e: Event) {
      e.preventDefault();
      setInvite(e as EvenementInstallation);
    }
    window.addEventListener("beforeinstallprompt", capter);
    return () => window.removeEventListener("beforeinstallprompt", capter);
  }, []);

  useEffect(() => {
    let annule = false;
    async function verifier(): Promise<EtatNotifs> {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "indisponible";
      if (Notification.permission === "denied") return "refusees";
      const reg = await navigator.serviceWorker.getRegistration();
      const abonnement = await reg?.pushManager.getSubscription();
      return abonnement && Notification.permission === "granted" ? "actives" : "a-activer";
    }
    verifier().then((etat) => {
      if (!annule) setNotifs(etat);
    });
    return () => {
      annule = true;
    };
  }, []);

  async function installer() {
    if (!invite) return;
    await invite.prompt();
    await invite.userChoice;
    setInvite(null);
  }

  async function activer() {
    setErreur(null);
    const cle = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!cle) {
      setErreur("Les notifications ne sont pas encore configurées sur ce site.");
      return;
    }
    setEnCours(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotifs(permission === "denied" ? "refusees" : "a-activer");
        return;
      }
      const abonnement = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: cleVersOctets(cle) }));
      const json = abonnement.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await enregistrerAbonnement(json, nomAppareil(plateforme));
      setNotifs("actives");
    } catch {
      setErreur("L'activation n'a pas marché. Réessaie dans un instant.");
    } finally {
      setEnCours(false);
    }
  }

  const iphoneSansInstall = plateforme === "iphone" && !installee;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center gap-3 px-4 py-3 md:px-8">
        <BrandMark size={36} />
        <span className="flex-1 font-medium">Kikimange</span>
        <Link href="/semaine" className="flex h-12 items-center rounded-full px-4 font-medium text-primary">
          {notifs === "actives" && installee ? "Continuer" : "Plus tard"}
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-4xl flex-1 gap-4 px-4 pb-10 md:grid-cols-2 md:items-start md:pt-10">
        <section className="rounded-[28px] bg-surface-container-low p-5 md:p-6">
          <h1 className="text-[28px] leading-9">{installee ? "Kikimange est installée" : `Mets Kikimange sur ton ${plateforme === "ordinateur" ? "ordinateur" : "écran d'accueil"}`}</h1>
          <p className="mt-1 text-on-surface-variant">
            {installee ? `Bienvenue ${prenom} ! Tu l'ouvres comme une vraie appli.` : "Comme une vraie appli, en quelques gestes."}
          </p>

          {!installee && plateforme === "iphone" && (
            <ol className="mt-5 space-y-3">
              <Etape n={1}>
                Touche <Pastille icone="ios_share">Partager</Pastille> en bas de Safari
              </Etape>
              <Etape n={2}>
                Choisis <Pastille icone="add_box">Sur l&apos;écran d&apos;accueil</Pastille>
              </Etape>
              <Etape n={3}>Ouvre Kikimange depuis la nouvelle icône, puis reviens ici pour les notifications</Etape>
            </ol>
          )}
          {!installee && plateforme !== "iphone" && (
            <div className="mt-5 space-y-3">
              {invite ? (
                <button onClick={installer} className="flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-on-primary">
                  <Icon name="install_mobile" size={20} />
                  Installer Kikimange
                </button>
              ) : (
                <ol className="space-y-3">
                  <Etape n={1}>
                    {plateforme === "android" ? (
                      <>Ouvre le menu <Pastille icone="more_vert">⋮</Pastille> de Chrome</>
                    ) : (
                      <>Clique sur <Pastille icone="install_desktop">Installer</Pastille> à droite de la barre d&apos;adresse</>
                    )}
                  </Etape>
                  <Etape n={2}>
                    Choisis <Pastille icone="add_to_home_screen">Installer l&apos;application</Pastille>
                  </Etape>
                </ol>
              )}
            </div>
          )}
        </section>

        <section className="rounded-[28px] bg-primary-container p-5 text-on-primary-container md:p-6">
          <h2 className="text-[22px] leading-7">Et ne rate aucun repas</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-3">
              <Icon name="event_repeat" />
              Le rappel du lundi pour remplir ta semaine
            </li>
            <li className="flex items-center gap-3">
              <Icon name="restaurant" />
              Quand Papa ou Maman lance un repas ouvert
            </li>
            <li className="flex items-center gap-3">
              <Icon name="celebration" />
              Pour les parents : qui vient, dès que c&apos;est validé
            </li>
          </ul>

          <div className="mt-6">
            {notifs === "actives" && (
              <p className="flex items-center gap-2 font-medium">
                <Icon name="check_circle" filled />
                Notifications activées sur cet appareil
              </p>
            )}
            {notifs === "a-activer" && !iphoneSansInstall && (
              <button onClick={activer} disabled={enCours} className="flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-on-primary disabled:opacity-60">
                <Icon name="notifications" size={20} />
                {enCours ? "Activation…" : "Activer les notifications"}
              </button>
            )}
            {iphoneSansInstall && notifs !== "actives" && (
              <p className="text-sm">Sur iPhone, les notifications marchent une fois l&apos;appli ajoutée à l&apos;écran d&apos;accueil (iOS 16.4 ou plus récent).</p>
            )}
            {notifs === "refusees" && (
              <p className="text-sm">Les notifications sont bloquées pour ce site. Tu peux les réautoriser dans les réglages de ton navigateur.</p>
            )}
            {notifs === "indisponible" && !iphoneSansInstall && <p className="text-sm">Ce navigateur ne gère pas les notifications. Papa ou Maman pourront te relancer par SMS.</p>}
            {erreur && <p className="mt-2 text-sm text-error">{erreur}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
