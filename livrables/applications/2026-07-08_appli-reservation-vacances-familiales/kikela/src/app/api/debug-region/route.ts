export async function GET() {
  const t0 = performance.now();
  const relevant = Object.fromEntries(
    Object.entries(process.env).filter(([k]) =>
      /REGION|AWS_|NETLIFY|LAMBDA|DEPLOY_/i.test(k)
    ).map(([k, v]) => [k, k.includes("TOKEN") || k.includes("SECRET") ? "***" : v])
  );

  let dbMs: number | null = null;
  try {
    const { createClient } = await import("@libsql/client/web");
    const client = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    const t1 = performance.now();
    await client.execute("SELECT 1");
    dbMs = performance.now() - t1;
  } catch {
    dbMs = -1;
  }

  return Response.json({
    env: relevant,
    dbQueryMs: dbMs,
    totalMs: performance.now() - t0,
  });
}
