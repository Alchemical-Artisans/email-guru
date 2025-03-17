import type { Vault } from "obsidian"
import { Path } from "./path.ts";

export interface FolderAdapter {
  contains(path: Path): boolean;
  create_file(path: Path, contents: string): Promise<void>;
  create_folder(path: Path): Promise<FolderAdapter>;
  get(path: Path): Promise<FolderAdapter | string>;
}

export class Folder {
  adapter: FolderAdapter;
  constructor(adapter: FolderAdapter) {
    this.adapter = adapter
  }

  async create_file(path: Path, contents: string) {
    if (path.has_folder())
      await this.create_file_in_subfolder(path, contents);
    else
      await this.adapter.create_file(path, contents)
  }

  private async create_file_in_subfolder(path: Path, contents: string) {
    await new Folder(await this.subfolder_adapter(path.base_folder))
      .create_file(path.below_base_folder, contents);
  }

  private async subfolder_adapter(folder_path: Path) {
    if (this.adapter.contains(folder_path)) {
      return await this.adapter.get(folder_path) as FolderAdapter;
    } else {
      return await this.adapter.create_folder(folder_path);
    }
  }

  async contains(path: Path): Promise<boolean> {
    if (path.has_folder()) {
      if (this.adapter.contains(path.base_folder)) {
        return new Folder(await this.adapter.get(path.base_folder) as FolderAdapter)
          .contains(path.below_base_folder)
      } else {
        return false
      }
    } else {
      return this.adapter.contains(path)
    }
  }
}

export class VaultAdapter implements FolderAdapter {
  private vault: Vault;
  private path: Path;
  constructor(vault: Vault, path: Path = new Path("")) {
    this.vault = vault
    this.path = path
  }

  contains(path: Path): boolean {
    return !!this.vault.getFileByPath(this.p(path).path)
      || !!this.vault.getFolderByPath(this.p(path).path)
  }

  async create_file(path: Path, contents: string) {
    await this.vault.create(this.p(path).path, contents)
  }

  async create_folder(path: Path): Promise<FolderAdapter> {
    await this.vault.createFolder(this.p(path).path)
    return new VaultAdapter(this.vault, this.p(path))
  }

  async get(path: Path): Promise<FolderAdapter | string> {
    if (this.vault.getFolderByPath(this.p(path).path))
      return new VaultAdapter(this.vault, this.p(path))
    else
      return await this.vault.readRaw(this.p(path).path)
  }

  private p(path: Path) {
    return this.path.join(path)
  }
}
