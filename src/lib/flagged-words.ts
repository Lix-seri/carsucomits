// Flagged-word matching (decision 0011). Text and terms are normalized the same way, so simple
// evasions still match: case, accents, spacing and punctuation, look-alike digits and symbols,
// and stretched letters ("thesssis").

const LOOKALIKE: Record<string, string> = { "0": "o", "1": "i", "!": "i", "|": "i", "3": "e", "4": "a", "@": "a", "5": "s", $: "s", "7": "t", "8": "b" };

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .replace(/[0134578!|@$]/g, (c) => LOOKALIKE[c])
    .replace(/[^a-z]/g, "") // spaces, punctuation, everything else
    .replace(/(.)\1+/g, "$1"); // stretched letters
}

/**
 * The terms that appear in the text. Matching ignores word boundaries on purpose ("t h e s i s"
 * must match), so it over-flags a little ("the sister"); a person reviews every flag.
 */
export function findFlaggedTerms<T extends { term: string }>(text: string, terms: T[]): T[] {
  const haystack = normalize(text);
  return terms.filter((t) => {
    const needle = normalize(t.term);
    // Under 3 letters (e.g. a term like "!!" becomes "i") would match almost any text.
    return needle.length >= 3 && haystack.includes(needle);
  });
}
