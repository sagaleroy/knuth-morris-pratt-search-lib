# knuth-morris-pratt-search-lib

Finds occurrences of a substring using a prefix table so that no character of
the searched text is compared twice.

```js
import { search, searchAll } from "./src/index.js";

search("abcabcabd", "abcabd"); // 3
search("abcdef", "gh");        // -1
searchAll("aaaa", "aa");       // [0, 1, 2]
```

The module exports four names:

- `buildPrefixTable(pattern)` — returns the KMP prefix table as an array of
  numbers, one per character of `pattern`.
- `search(text, pattern)` — returns the index of the first match, or `-1`.
- `searchAll(text, pattern)` — returns every start index, including
  overlapping matches.
- `findAll(text, pattern)` — an alias for `searchAll`.

All indexes are UTF-16 code-unit indexes, the same unit
`String.prototype.indexOf` uses. For ASCII and BMP text this matches what you
expect; text containing astral characters will report code-unit offsets.

## Why this exists

The built-in `String.prototype.indexOf` is already fast, and for a single
search it is usually the right tool. This library is for the case where the
same pattern is matched against many inputs, or where the input is large and
adversarial: KMP guarantees O(n + m) time, while naive scanning can degrade to
O(n * m) on inputs like `"aaaa...a"` with pattern `"aaab"`. The trade-off is
that KMP allocates and fills an O(m) prefix table up front, so for a one-off
search of a short pattern it does more work than `indexOf`. Use it when the
worst case matters.

The prefix table is rebuilt on every call. If you plan to search the same
pattern repeatedly, call `buildPrefixTable` yourself and reuse the result;
the exported `search` and `searchAll` are convenience wrappers that build it
internally.

## The awkward edge

An empty pattern is handled differently by the two search functions, and this
is deliberate. `search(text, "")` returns `0`, matching
`String.prototype.indexOf`. `searchAll(text, "")` returns `[]`, because
returning every index (or just `0`) would be a surprising result for a
function whose contract is "positions where the pattern occurs". If you need
the `indexOf` behaviour, use `search`; if you need a list, `searchAll` will
give you an empty one and you can special-case it yourself.
