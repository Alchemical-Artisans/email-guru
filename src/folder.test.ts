import { expect, test } from "vitest";
import { Folder, type FolderAdapter } from "./folder.ts";
import { Path } from "./path.ts";

class MemoryFolderAdapter implements FolderAdapter {
  files: { [name: string]: string | FolderAdapter }
  constructor() {
    this.files = {}
  }

  async create_file(path: Path, contents: string) {
    this.files[path.path] = contents
  }

  async create_folder(path: Path) {
    this.files[path.path] = new MemoryFolderAdapter()
    return this.files[path.path] as MemoryFolderAdapter
  }

  contains(path: Path) {
    return path.path in this.files
  }

  async get(path: Path): Promise<FolderAdapter | string> {
    return this.files[path.path] as FolderAdapter | string
  }
}

test("file doesn't exist", async () => {
  const folder = new Folder(new MemoryFolderAdapter())
  expect(await folder.contains(new Path("foo.md"))).toBeFalsy()
})

test("creates a file", async () => {
  const folder = new Folder(new MemoryFolderAdapter())
  folder.create_file(new Path("foo.md"), "bar")
  expect(await folder.contains(new Path("foo.md"))).toBeTruthy()
  expect(await folder.contains(new Path("bar.md"))).toBeFalsy()
})

test("creates a folder, if necessary", async () => {
  const folder = new Folder(new MemoryFolderAdapter())
  await folder.create_file(new Path("foo/bar.md"), "baz")
  expect(await folder.contains(new Path("foo"))).toBeTruthy()
})

test("reuses existing folder", async () => {
  const folder = new Folder(new MemoryFolderAdapter())
  await folder.create_file(new Path("foo/bar.md"), "bar")
  await folder.create_file(new Path("foo/baz.md"), "baz")
  expect(await folder.contains(new Path("foo/bar.md")))
})

test("contains works on folder contents", async () => {
  const folder = new Folder(new MemoryFolderAdapter())
  await folder.create_file(new Path("foo/bar.md"), "baz")
  expect(await folder.contains(new Path("foo/bar.md"))).toBeTruthy()
})

test("creates deeply nested file", async () => {
  const folder = new Folder(new MemoryFolderAdapter())
  const base_path = new Path("path/to/something/really")

  const path = base_path.join("deep.md")
  expect(await folder.contains(path)).toBeFalsy()
  await folder.create_file(path, "foo")
  expect(await folder.contains(path)).toBeTruthy()

  const new_path = base_path.join("profound.md")
  await folder.create_file(new_path, "foo")
  expect(await folder.contains(path)).toBeTruthy()
  expect(await folder.contains(new_path)).toBeTruthy()
})
