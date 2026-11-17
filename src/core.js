/**
 * Knuth-Morris-Pratt substring search.
 *
 * The point of KMP is the prefix table (also called the failure function or
 * the longest proper prefix-suffix table). It records, for each position in
 * the pattern, the length of the longest proper prefix of `pattern[0..i]`
 * that is also a suffix of that same slice. When a mismatch happens we can
 * slide the pattern forward by `i - table[i - 1]` characters instead of by
 * one, so no character of the haystack is ever compared twice. That gives
 * O(n + m) worst-case time and O(m) extra space.
 *
 * All functions operate on JavaScript strings and compare UTF-16 code units,
 * which is what `String.prototype.indexOf` does. Indexes returned by this
 * module are therefore code-unit indexes, not code-point indexes. For the
 * ASCII and BMP text this library is aimed at the two coincide; for text
 * containing astral characters they do not, and callers who need code-point
 * indexes should convert first. This is a deliberate choice: re-implementing
 * code-point iteration would make the common case slower for no benefit.
 */

/**
 * Build the KMP prefix table for `pattern`.
 *
 * `table[i]` is the length of the longest proper prefix of `pattern.slice(0,
 * i + 1)` that is also a suffix of that slice. The first entry is always 0
 * because a single character has no proper prefix.
 *
 * The table is built by the classic two-pointer scan: `length` tracks the
 * candidate prefix length for the current position, and we fall back through
 * already-computed entries on mismatch. Falling back is what makes this O(m)
 * rather than O(m^2).
 *
 * @param {string} pattern
 * @returns {number[]} prefix table of length `pattern.length`
 */
export function buildPrefixTable(pattern) {
  if (typeof pattern !== "string") {
    throw new TypeError("pattern must be a string");
  }

  const length = pattern.length;
  const table = new Array(length).fill(0);
  let prefixLength = 0;

  for (let i = 1; i < length; i += 1) {
    while (prefixLength > 0 && pattern[i] !== pattern[prefixLength]) {
      prefixLength = table[prefixLength - 1];
    }
    if (pattern[i] === pattern[prefixLength]) {
      prefixLength += 1;
    }
    table[i] = prefixLength;
  }

  return table;
}

/**
 * Return the index of the first occurrence of `pattern` in `text`, or -1.
 *
 * An empty pattern matches at index 0 by convention, matching
 * `String.prototype.indexOf`. Empty text with a non-empty pattern returns -1.
 *
 * @param {string} text
 * @param {string} pattern
 * @returns {number}
 */
export function search(text, pattern) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }
  if (typeof pattern !== "string") {
    throw new TypeError("pattern must be a string");
  }

  if (pattern.length === 0) {
    return 0;
  }
  if (pattern.length > text.length) {
    return -1;
  }

  const table = buildPrefixTable(pattern);
  let matched = 0;

  for (let i = 0; i < text.length; i += 1) {
    while (matched > 0 && text[i] !== pattern[matched]) {
      matched = table[matched - 1];
    }
    if (text[i] === pattern[matched]) {
      matched += 1;
    }
    if (matched === pattern.length) {
      return i - pattern.length + 1;
    }
  }

  return -1;
}

/**
 * Return every (possibly overlapping) start index of `pattern` in `text`.
 *
 * Overlaps are included because KMP naturally finds them and callers who want
 * non-overlapping matches can filter afterwards. An empty pattern yields an
 * empty array: yielding every index would be surprising, and the alternative
 * of yielding just 0 would be inconsistent with `searchAll` returning all
 * matches. `search` still returns 0 for an empty pattern, matching
 * `String.prototype.indexOf`.
 *
 * @param {string} text
 * @param {string} pattern
 * @returns {number[]}
 */
export function searchAll(text, pattern) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }
  if (typeof pattern !== "string") {
    throw new TypeError("pattern must be a string");
  }

  if (pattern.length === 0) {
    return [];
  }
  if (pattern.length > text.length) {
    return [];
  }

  const table = buildPrefixTable(pattern);
  const matches = [];
  let matched = 0;

  for (let i = 0; i < text.length; i += 1) {
    while (matched > 0 && text[i] !== pattern[matched]) {
      matched = table[matched - 1];
    }
    if (text[i] === pattern[matched]) {
      matched += 1;
    }
    if (matched === pattern.length) {
      matches.push(i - pattern.length + 1);
      // Continue from the longest proper prefix-suffix so overlapping
      // occurrences are reported too. Resetting to 0 would miss them.
      matched = table[matched - 1];
    }
  }

  return matches;
}

/**
 * Alias for `searchAll`, kept because "find all" reads naturally at call
 * sites and some callers expect that name.
 *
 * @param {string} text
 * @param {string} pattern
 * @returns {number[]}
 */
export function findAll(text, pattern) {
  return searchAll(text, pattern);
}
