import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPrefixTable,
  search,
  searchAll,
  findAll,
} from "../src/index.js";

test("buildPrefixTable on a classic overlapping pattern", () => {
  assert.deepEqual(buildPrefixTable("ababaca"), [0, 0, 1, 2, 3, 0, 1]);
});

test("buildPrefixTable on a single character is [0]", () => {
  assert.deepEqual(buildPrefixTable("a"), [0]);
});

test("buildPrefixTable on the empty string is empty", () => {
  assert.deepEqual(buildPrefixTable(""), []);
});

test("buildPrefixTable on a string with no self-overlap is all zeros", () => {
  assert.deepEqual(buildPrefixTable("abcd"), [0, 0, 0, 0]);
});

test("buildPrefixTable on a repeated character", () => {
  assert.deepEqual(buildPrefixTable("aaaa"), [0, 1, 2, 3]);
});

test("search finds a match at the start", () => {
  assert.equal(search("abcabcabd", "abcabd"), 3);
});

test("search returns -1 when the pattern is absent", () => {
  assert.equal(search("abcdef", "gh"), -1);
});

test("search returns 0 for an empty pattern", () => {
  assert.equal(search("anything", ""), 0);
});

test("search returns -1 when the pattern is longer than the text", () => {
  assert.equal(search("ab", "abc"), -1);
});

test("search handles a match that requires falling back", () => {
  // The naive scan would re-compare after the partial match; KMP must not.
  assert.equal(search("aabaabaaa", "aabaaa"), 3);
});

test("search on identical text and pattern returns 0", () => {
  assert.equal(search("hello", "hello"), 0);
});

test("searchAll reports overlapping matches", () => {
  assert.deepEqual(searchAll("aaaa", "aa"), [0, 1, 2]);
});

test("searchAll reports multiple separated matches", () => {
  assert.deepEqual(searchAll("abababab", "aba"), [0, 2, 4]);
});

test("searchAll returns an empty array when nothing matches", () => {
  assert.deepEqual(searchAll("abcdef", "xy"), []);
});

test("searchAll returns an empty array for an empty pattern", () => {
  assert.deepEqual(searchAll("abc", ""), []);
});

test("searchAll returns an empty array when the pattern is longer than the text", () => {
  assert.deepEqual(searchAll("ab", "abc"), []);
});

test("findAll is an alias for searchAll", () => {
  assert.deepEqual(findAll("aaaa", "aa"), [0, 1, 2]);
});

test("search rejects a non-string pattern", () => {
  assert.throws(() => search("abc", 123), TypeError);
});

test("buildPrefixTable rejects a non-string argument", () => {
  assert.throws(() => buildPrefixTable(null), TypeError);
});
