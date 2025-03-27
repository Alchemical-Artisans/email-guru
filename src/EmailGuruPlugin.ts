import {
  App,
  PluginSettingTab,
  type PluginManifest,
} from 'obsidian';
import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import { EmailGuruPluginSettings } from './EmailGuruPluginSettings.ts';
import { EmailGuruPluginSettingsTab } from './EmailGuruPluginSettingsTab.ts';
import { EmailServer, ImapConnection } from './email_server.ts';
import { ImapFlow } from 'imapflow';
import { Folder, VaultAdapter } from './folder.ts';
import { toISODate } from './utils.ts';
import { Markdown } from './markdown.ts';
import { MarkdownFileRepository } from './MarkdownFileRepository.ts';
import { Email } from './email.ts';

export class EmailGuruPlugin extends PluginBase<EmailGuruPluginSettings> {
  repo: MarkdownFileRepository;
  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest)
    this.repo = new MarkdownFileRepository(this.app.vault, this.app.metadataCache)
  }

  protected override createPluginSettings(data: unknown): EmailGuruPluginSettings {
    return new EmailGuruPluginSettings(data);
  }

  protected override createPluginSettingsTab(): null | PluginSettingTab {
    return new EmailGuruPluginSettingsTab(this);
  }

  protected override onloadComplete(): void {
    this.repo.populate_id_cache()

    this.addCommand({
      callback: this.updateMessageCounts.bind(this),
      id: 'update-message-counts',
      name: 'Update Message Counts'
    });

    this.addCommand({
      callback: this.createEmailFiles.bind(this),
      id: "create-email-files",
      name: "Create Email Files",
    })

    this.addRibbonIcon("mail", "Fetch Email", async () => {
      await this.updateMessageCounts()
      await this.createEmailFiles()
    })

    this.app.metadataCache.on("changed", async (_file, _data, cache) => {
      if (cache.frontmatter && cache.frontmatter["id"]) {
        if (cache.frontmatter["archived"]) {
          await this.server.archive(Email.from(cache.frontmatter))
        }
      }
    })
  }

  private async createEmailFiles() {
    const folder = new Folder(new VaultAdapter(this.app.vault))
    const messages = this.settings.folder.join("Inbox")

    for (let email of await this.server.emails()) {
      if (!this.repo.find_file(email.id)) {
        const path = messages.join(`${email.subject.replace(new RegExp("[:?\\\\/]", "g"), "")}.md`)

        if (!await folder.contains(path)) {
          await folder.create_file(path, (await email.markdown()).toString())
        }
      }
    }
  }

  private async updateMessageCounts() {
    const count = await this.server.inbox_count()

    const folder = new Folder(
      new VaultAdapter(this.app.vault)
    )
    const path = this.settings.folder
      .join("Daily Stats")
      .join(`${toISODate(new Date())}.md`)
    if (!await folder.contains(path)) {
      await folder.create_file(
        path,
        new Markdown("", { count }).toString()
      )
    }
  }

  private get server() {
    return new EmailServer(new ImapConnection(new ImapFlow({
      host: this.settings.host,
      port: this.settings.port,
      secure: true,
      auth: {
        user: this.settings.user,
        pass: this.settings.password,
      },
    })));
  }
}
