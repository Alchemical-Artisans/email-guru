import {
  PluginSettingTab,
} from 'obsidian';
import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import { EmailGuruPluginSettings } from './EmailGuruPluginSettings.ts';
import { EmailGuruPluginSettingsTab } from './EmailGuruPluginSettingsTab.ts';
import { EmailServer, ImapConnection, type Address } from './email_server.ts';
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

    this.addRibbonIcon("mail", "Fetch Email", this.updateMessageCounts.bind(this))

    // const INTERVAL_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
    // this.registerInterval(window.setInterval(this.handleSampleIntervalTick.bind(this), INTERVAL_IN_MILLISECONDS));
  }

  private async createEmailFiles() {
    const folder = new Folder(new VaultAdapter(this.app.vault))
    const messages = this.settings.folder.join("Messages")

    for (let email of await this.server.emails()) {
      const path = messages.join(`${email.id}.md`)
      if (!await folder.contains(path)) {
        const stringify_address = (addrs: Address[]) => addrs.map(
          (addr) => addr.name
            ? `${addr.name} <${addr.address}>`
            : addr.address
        )
        await folder.create_file(path, new Markdown(email.body, {
          id: email.id,
          subject: email.subject,
          from: stringify_address(email.from || []),
          to: stringify_address(email.to || []),
          cc: stringify_address(email.cc || []),
        }).toString())
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
