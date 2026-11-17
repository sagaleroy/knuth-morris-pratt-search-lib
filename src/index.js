/**
 * Public entry point for the Knuth-Morris-Pratt substring search library.
 *
 * Keeping the re-exports in a dedicated module means consumers import from a
 * single stable path (`knuth-morris-pratt-search-lib`) while the algorithm
 * itself lives in `core.js`. If the internal layout changes later, only this
 * file needs to move.
 */
export {
  buildPrefixTable,
  search,
  searchAll,
  findAll,
} from "./core.js";
