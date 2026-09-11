const base = process.env.BASE_URL || "http://localhost:3001";

async function main() {
  const results = [];

  const home = await fetch(`${base}/`);
  results.push(["HOME", home.status]);

  const cargo = await fetch(`${base}/cargo`);
  results.push(["CARGO", cargo.status]);

  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "admin123" }),
  });
  const loginJson = await login.json();
  const cookie = login.headers.getSetCookie?.() || [];
  const cookieHeader = cookie.map((c) => c.split(";")[0]).join("; ");
  results.push(["LOGIN", login.status, loginJson.ok || loginJson.error, Boolean(cookieHeader)]);

  const create = await fetch(`${base}/api/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      name: "Smoke test tovar",
      trackNumber: "DX-SMOKE-001",
      category: "NEW",
      status: "CHINA_WAREHOUSE",
      date: "2026-07-17",
      description: "smoke",
    }),
  });
  const created = await create.json();
  results.push(["CREATE", create.status, created.trackNumber || created.error]);

  if (created.id) {
    const del = await fetch(`${base}/api/items/${created.id}`, {
      method: "DELETE",
      headers: { Cookie: cookieHeader },
    });
    results.push(["DELETE", del.status]);
  }

  const exp = await fetch(`${base}/api/reports/export`, {
    headers: { Cookie: cookieHeader },
  });
  results.push([
    "EXPORT",
    exp.status,
    exp.headers.get("content-type")?.includes("spreadsheet"),
  ]);

  for (const row of results) {
    console.log(row.join(" | "));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
