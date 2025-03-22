import {
  PluginSettingTab,
  TFile,
} from 'obsidian';
import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import { EmailGuruPluginSettings } from './EmailGuruPluginSettings.ts';
import { EmailGuruPluginSettingsTab } from './EmailGuruPluginSettingsTab.ts';
import { EmailServer, ImapConnection } from './email_server.ts';
import { ImapFlow } from 'imapflow';
import { Folder, VaultAdapter } from './folder.ts';
import { toISODate } from './utils.ts';
import { Markdown } from './markdown.ts';

export class EmailGuruPlugin extends PluginBase<EmailGuruPluginSettings> {
  protected override createPluginSettings(data: unknown): EmailGuruPluginSettings {
    return new EmailGuruPluginSettings(data);
  }

  protected override createPluginSettingsTab(): null | PluginSettingTab {
    return new EmailGuruPluginSettingsTab(this);
  }

  protected override onloadComplete(): void {
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

    // const INTERVAL_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
    // this.registerInterval(window.setInterval(this.handleSampleIntervalTick.bind(this), INTERVAL_IN_MILLISECONDS));
  }

  private async createEmailFiles() {
    const folder = new Folder(new VaultAdapter(this.app.vault))
    const messages = this.settings.folder.join("Messages")

    const filesById = this.app.vault.getMarkdownFiles().reduce((lookup, file) => {
      const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter
      if (frontmatter && frontmatter["id"])
        lookup[frontmatter["id"]] = file
      return lookup
    }, {} as { [id: number]: TFile });

    for (let email of await this.server.emails()) {
      if (!filesById[email.id]) {
        const path = messages.join(`${email.subject.replace(new RegExp("[:?\\\\/]", "g"), "")}.md`)
        console.warn(path)

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
    } else {
      console.info("File already exists", path.path)
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
