import {
  PluginSettingTab,
} from 'obsidian';
import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import { EmailGuruPluginSettings } from './EmailGuruPluginSettings.ts';
import { EmailGuruPluginSettingsTab } from './EmailGuruPluginSettingsTab.ts';
import { EmailServer, ImapConnection } from './email_server.ts';
import { ImapFlow } from 'imapflow';
import { Folder, VaultAdapter } from './folder.ts';

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

    // const INTERVAL_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
    // this.registerInterval(window.setInterval(this.handleSampleIntervalTick.bind(this), INTERVAL_IN_MILLISECONDS));
  }

  private async updateMessageCounts() {
    const count = await this.server.inbox_count()

    const folder = new Folder(
      new VaultAdapter(this.app.vault)
    )
    const path = this.settings.folder
      .join("Daily Stats")
      .join(`${new Date().toISOString().split(/T/)[0]}.md`)
    if (!await folder.contains(path)) {
      await folder.create_file(
        path,
        `---\ncount: ${count}\n---\n`
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
