const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const net = require("node:net");

async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

test("CRUD e persistência dos dois recursos", async () => {
  const dir = mkdtempSync(join(tmpdir(), "nest-crud-"));
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  let server;
  async function start() {
    server = spawn(process.execPath, ["dist/app.js"], { env: { ...process.env, DATA_DIR: dir, PORT: String(port) }, stdio: "ignore" });
    for (let i = 0; i < 100; i++) {
      try { await fetch(`${base}/tasks`); return; } catch { await new Promise(resolve => setTimeout(resolve, 50)); }
    }
    throw new Error("Servidor não iniciou");
  }
  async function stop() {
    if (server.exitCode !== null || server.signalCode !== null) return;
    const exited = new Promise(resolve => server.once("exit", resolve));
    server.kill();
    await exited;
  }
  async function request(path, method = "GET", body) {
    return fetch(base + path, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  }
  try {
    await start();
    const ids = {};
    for (const resource of ["tasks", "projects"]) {
      const path = `/${resource}`;
      assert.equal((await request(path, "POST", {})).status, 400);
      let response = await request(path, "POST", { name: "Inicial" });
      assert.equal(response.status, 201);
      ids[resource] = (await response.json()).id;
      const item = `${path}/${ids[resource]}`;
      assert.equal((await (await request(path)).json()).length, 1);
      assert.equal((await (await request(item)).json()).name, "Inicial");
      assert.equal((await (await request(item, "PUT", { name: "Novo" })).json()).name, "Novo");
      assert.equal((await (await request(item, "PATCH", { name: "Final" })).json()).name, "Final");
    }
    await stop();
    await start();
    for (const resource of ["tasks", "projects"]) {
      const item = `/${resource}/${ids[resource]}`;
      assert.equal((await (await request(item)).json()).name, "Final");
      assert.equal((await request(item, "DELETE")).status, 204);
      assert.equal((await request(item)).status, 404);
    }
  } finally {
    if (server) await stop();
    rmSync(dir, { recursive: true, force: true });
  }
});
