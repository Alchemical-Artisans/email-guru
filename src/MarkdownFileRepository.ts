import type { MetadataCache, TFile, Vault } from "obsidian";

type IdCache = { [id: number]: TFile }

export class MarkdownFileRepository {
  vault: Vault;
  metadata_cache: MetadataCache;
  id_cache?: IdCache
  constructor(vault: Vault, metadata_cache: MetadataCache) {
    this.vault = vault
    this.metadata_cache = metadata_cache
  }

  find_file(id: number) {
    this.ensure_id_cache_is_populated();
    return this.id_cache![id]
  }

  private ensure_id_cache_is_populated() {
    if (!this.id_cache) {
      this.populate_id_cache();
    }
  }

  populate_id_cache() {
    this.id_cache = {}
    for (let file of this.vault.getMarkdownFiles()) {
      this.associate_file_with_id(file);
    }

    this.metadata_cache.on("changed", (file) => this.associate_file_with_id(file))
  }

  private associate_file_with_id(file: TFile) {
    const frontmatter = this.metadata_cache.getFileCache(file)?.frontmatter;
    if (frontmatter && frontmatter["id"])
      this.id_cache![frontmatter["id"]] = file;
  }
}
