/**
 * Minimal declarative formula language: numbers, identifiers, + - *, unary
 * minus, parentheses. Deliberately not a general expression language — packs
 * stay data, and every value stays explainable.
 */

export type FormulaContext = Record<string, number>;

type Token =
  | { kind: "num"; value: number }
  | { kind: "ident"; name: string }
  | { kind: "op"; op: "+" | "-" | "*" | "(" | ")" };

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i]!;
    if (/\s/.test(ch)) {
      i++;
    } else if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j]!)) j++;
      tokens.push({ kind: "num", value: Number(src.slice(i, j)) });
      i = j;
    } else if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j]!)) j++;
      tokens.push({ kind: "ident", name: src.slice(i, j) });
      i = j;
    } else if (ch === "+" || ch === "-" || ch === "*" || ch === "(" || ch === ")") {
      tokens.push({ kind: "op", op: ch });
      i++;
    } else {
      throw new FormulaError(`Unexpected character '${ch}' in formula "${src}"`);
    }
  }
  return tokens;
}

export class FormulaError extends Error {}

/** Recursive-descent evaluator. Grammar: expr := term (('+'|'-') term)*;
 * term := factor ('*' factor)*; factor := num | ident | '-' factor | '(' expr ')' */
export function evaluateFormula(src: string, context: FormulaContext): number {
  const tokens = tokenize(src);
  let pos = 0;

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function factor(): number {
    const t = next();
    if (!t) throw new FormulaError(`Unexpected end of formula "${src}"`);
    if (t.kind === "num") return t.value;
    if (t.kind === "ident") {
      const value = context[t.name];
      if (value === undefined) {
        throw new FormulaError(`Unknown identifier '${t.name}' in formula "${src}"`);
      }
      return value;
    }
    if (t.op === "-") return -factor();
    if (t.op === "(") {
      const value = expr();
      const close = next();
      if (!close || close.kind !== "op" || close.op !== ")") {
        throw new FormulaError(`Missing ')' in formula "${src}"`);
      }
      return value;
    }
    throw new FormulaError(`Unexpected token in formula "${src}"`);
  }

  function term(): number {
    let value = factor();
    while (peek()?.kind === "op" && (peek() as { op: string }).op === "*") {
      next();
      value *= factor();
    }
    return value;
  }

  function expr(): number {
    let value = term();
    for (;;) {
      const t = peek();
      if (t?.kind === "op" && (t.op === "+" || t.op === "-")) {
        next();
        const rhs = term();
        value = t.op === "+" ? value + rhs : value - rhs;
      } else {
        return value;
      }
    }
  }

  const result = expr();
  if (pos !== tokens.length) {
    throw new FormulaError(`Trailing input in formula "${src}"`);
  }
  return result;
}
