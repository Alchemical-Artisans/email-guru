import { test, expect } from "vitest"
import { Path } from "./path.ts"

test("base folder", () => {
  expect(new Path("foo/bar.md").base_folder.path).toEqual("foo")
})

test("below base folder", () => {
  expect(new Path("something/nested/really/deep.md").below_base_folder.path).toEqual("nested/really/deep.md")
})

test("has folder", () => {
  expect(new Path("foo/bar.md").has_folder()).toBeTruthy()
})

test("doesn't have folder", () => {
  expect(new Path("bar.md").has_folder()).toBeFalsy()
})

test("join", () => {
  expect(new Path("foo").join(new Path("bar.md")).path).toEqual("foo/bar.md")
})
