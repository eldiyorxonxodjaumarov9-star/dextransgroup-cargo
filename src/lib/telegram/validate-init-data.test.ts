import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import {
  buildDataCheckString,
  computeWebAppDataHash,
  validateTelegramInitData,
  InitDataValidationError,
} from "./validate-init-data";

const BOT_TOKEN = "123456:ABC-DEF_test-token-for-unit-tests";

function signInitData(fields: Record<string, string>) {
  const params = new URLSearchParams(fields);
  const dataCheckString = buildDataCheckString(params);
  const hash = computeWebAppDataHash(dataCheckString, BOT_TOKEN);
  params.set("hash", hash);
  return params.toString();
}

describe("validateTelegramInitData", () => {
  it("accepts a valid signature and user", () => {
    const authDate = Math.floor(Date.now() / 1000);
    const initData = signInitData({
      auth_date: String(authDate),
      user: JSON.stringify({ id: 42, first_name: "Ada", username: "ada" }),
      query_id: "AAE",
    });

    const result = validateTelegramInitData(initData, BOT_TOKEN, {
      nowSeconds: authDate,
    });
    assert.equal(result.user.id, 42);
    assert.equal(result.authDate, authDate);
  });

  it("rejects invalid signature", () => {
    const authDate = Math.floor(Date.now() / 1000);
    const initData = signInitData({
      auth_date: String(authDate),
      user: JSON.stringify({ id: 42, first_name: "Ada" }),
    });
    const tampered = initData.replace(/hash=[0-9a-f]+/, "hash=" + "ab".repeat(32));
    assert.throws(
      () => validateTelegramInitData(tampered, BOT_TOKEN),
      (err: unknown) =>
        err instanceof InitDataValidationError && err.status === 401
    );
  });

  it("rejects missing hash", () => {
    assert.throws(
      () =>
        validateTelegramInitData(
          `auth_date=${Math.floor(Date.now() / 1000)}&user=${encodeURIComponent(JSON.stringify({ id: 1 }))}`,
          BOT_TOKEN
        ),
      (err: unknown) =>
        err instanceof InitDataValidationError && /hash/i.test(err.message)
    );
  });

  it("rejects expired auth_date", () => {
    const authDate = Math.floor(Date.now() / 1000) - 10_000;
    const initData = signInitData({
      auth_date: String(authDate),
      user: JSON.stringify({ id: 7 }),
    });
    assert.throws(
      () =>
        validateTelegramInitData(initData, BOT_TOKEN, {
          maxAgeSeconds: 600,
          nowSeconds: Math.floor(Date.now() / 1000),
        }),
      (err: unknown) =>
        err instanceof InitDataValidationError && /expired/i.test(err.message)
    );
  });

  it("rejects malformed user JSON", () => {
    const authDate = Math.floor(Date.now() / 1000);
    const initData = signInitData({
      auth_date: String(authDate),
      user: "{not-json",
    });
    assert.throws(
      () => validateTelegramInitData(initData, BOT_TOKEN),
      InitDataValidationError
    );
  });

  it("sorts fields alphabetically in data_check_string", () => {
    const params = new URLSearchParams();
    params.set("user", "{\"id\":1}");
    params.set("auth_date", "100");
    params.set("query_id", "z");
    params.set("hash", "deadbeef");
    const check = buildDataCheckString(params);
    assert.equal(
      check,
      ["auth_date=100", 'query_id=z', 'user={"id":1}'].join("\n")
    );
  });

  it("uses timing-safe comparison (wrong length hash fails closed)", () => {
    const authDate = Math.floor(Date.now() / 1000);
    const initData = signInitData({
      auth_date: String(authDate),
      user: JSON.stringify({ id: 9 }),
    });
    const short = initData.replace(/hash=[0-9a-f]+/, "hash=ab");
    assert.throws(
      () => validateTelegramInitData(short, BOT_TOKEN),
      InitDataValidationError
    );
  });

  it("HMAC secret uses WebAppData key", () => {
    const secret = createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
    const expected = createHmac("sha256", secret)
      .update("auth_date=1\nuser={\"id\":1}")
      .digest("hex");
    assert.equal(
      computeWebAppDataHash('auth_date=1\nuser={"id":1}', BOT_TOKEN),
      expected
    );
  });
});
