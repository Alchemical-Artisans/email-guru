import { expect, test } from "vitest"
import { Frontmatter, FrontmatterString, Markdown, OnlyDate } from "./markdown.ts"

test("empty file", () => {
  expect(new Markdown("").toString()).toEqual("")
})

test("simple contents", () => {
  expect(new Markdown("body").toString()).toEqual("body")
})

test("empty frontmatter", () => {
  expect(new Markdown("body", {}).toString()).toEqual("---\n---\nbody")
})

test("undefined frontmatter", () => {
  expect(new Markdown("", { foo: undefined }).toString()).toEqual("---\nfoo:\n---\n")
})

test("null frontmatter", () => {
  expect(new Markdown("", { foo: null }).toString()).toEqual("---\nfoo:\n---\n")
})

test("empty string frontmatter", () => {
  expect(new Markdown("", { foo: "" }).toString()).toEqual('---\nfoo:\n---\n')
})

test("simple string frontmatter", () => {
  expect(new Markdown("", { foo: "bar" }).toString()).toEqual('---\nfoo: bar\n---\n')
})

test("string with squre brackets", () => {
  expect(new FrontmatterString("[a]").needs_quotes()).toBeTruthy()
})

test("string with colon", () => {
  expect(new Markdown("", { foo: "a: b" }).toString()).toEqual('---\nfoo: "a: b"\n---\n')
})

test("quoted string with quotes", () => {
  expect(new Markdown("", { foo: 'a: b"' }).toString()).toEqual('---\nfoo: \'a: b"\'\n---\n')
})

test("quoted string with both quotes", () => {
  expect(new Markdown("", { foo: 'a: b"\'' }).toString()).toEqual('---\nfoo: "a: b\\"\'"\n---\n')
})

test("multiline string frontmatter", () => {
  expect(new Markdown("", { foo: "bar: boo\nbaz" }).toString()).toEqual(`---
foo: |-
  bar: boo
  baz
---
`)
})

test("number frontmatter", () => {
  expect(new Markdown("", { foo: 5 }).toString()).toEqual("---\nfoo: 5\n---\n")
})

test("empty list", () => {
  expect(new Markdown("", { foo: [] }).toString()).toEqual("---\nfoo:\n---\n")
})

test("single item in list", () => {
  expect(new Markdown("", { foo: ["a"] }).toString()).toEqual(`---
foo:
  - a
---
`)
})

test("multi item list", () => {
  expect(new Markdown("", { foo: ["a", "b"] }).toString()).toEqual(`---
foo:
  - a
  - b
---
`)
})

test("booleans", () => {
  expect(new Markdown("", { true: true, false: false }).toString()).toEqual(`---
true: true
false: false
---
`)
})

test("date", () => {
  expect(new Markdown("", { date: new OnlyDate("2025-04-18") }).toString()).toEqual(`---
date: 2025-04-18
---
`)
})

test("date/time", () => {
  expect(new Markdown("", { date: new Date("2025-04-18T15:30:00+00:00") }).toString()).toEqual(`---
date: 2025-04-18T15:30:00
---
`)
})
