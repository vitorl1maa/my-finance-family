import assert from "node:assert/strict";
import test from "node:test";

import { formatBrlInput, parseBrlInputToCents } from "../src/shared/utils/money.ts";

test("formats typed digits as a BRL amount", () => {
  assert.equal(formatBrlInput("4"), "R$ 0,04");
  assert.equal(formatBrlInput("4000"), "R$ 40,00");
  assert.equal(formatBrlInput("R$ 1.234,56"), "R$ 1.234,56");
  assert.equal(formatBrlInput(""), "");
});

test("parses a BRL input into cents", () => {
  assert.equal(parseBrlInputToCents("R$ 40,00"), 4000);
  assert.equal(parseBrlInputToCents("R$ 1.234,56"), 123456);
  assert.equal(parseBrlInputToCents(""), 0);
});
