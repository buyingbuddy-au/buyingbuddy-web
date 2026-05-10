export function normaliseQldRego(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export function validateQldRego(input: string): { ok: true; rego: string } | { ok: false; error: string } {
  const rego = normaliseQldRego(input);

  if (!rego) {
    return { ok: false, error: "Pop the QLD rego in first." };
  }

  if (rego.length < 3) {
    return { ok: false, error: "That looks too short for a QLD rego. Check the plate and try again." };
  }

  if (rego.length > 7) {
    return { ok: false, error: "That looks too long for a QLD rego. Use the plate only, no state or spaces." };
  }

  return { ok: true, rego };
}
