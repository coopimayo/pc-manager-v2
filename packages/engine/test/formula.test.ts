import { describe, expect, it } from "vitest";
import { evaluateFormula, FormulaError } from "../src/formula.js";

describe("evaluateFormula", () => {
  const ctx = { level: 5, profBonus: 3, conMod: 2 };

  it("evaluates plain numbers", () => {
    expect(evaluateFormula("30", {})).toBe(30);
  });

  it("evaluates identifiers from context", () => {
    expect(evaluateFormula("profBonus", ctx)).toBe(3);
  });

  it("evaluates arithmetic with precedence", () => {
    expect(evaluateFormula("8 + conMod * 2", ctx)).toBe(12);
    expect(evaluateFormula("(8 + conMod) * 2", ctx)).toBe(20);
    expect(evaluateFormula("level - 1", ctx)).toBe(4);
  });

  it("supports unary minus", () => {
    expect(evaluateFormula("-2 + level", ctx)).toBe(3);
  });

  it("throws on unknown identifiers", () => {
    expect(() => evaluateFormula("sneakiness", ctx)).toThrow(FormulaError);
  });

  it("throws on malformed input", () => {
    expect(() => evaluateFormula("1 +", ctx)).toThrow(FormulaError);
    expect(() => evaluateFormula("(1 + 2", ctx)).toThrow(FormulaError);
    expect(() => evaluateFormula("1 2", ctx)).toThrow(FormulaError);
    expect(() => evaluateFormula("2 / 1", ctx)).toThrow(FormulaError);
  });
});
