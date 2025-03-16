import {
  PluginSettingTab,
  TFile
} from 'obsidian';
import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import { EmailGuruPluginSettings } from './EmailGuruPluginSettings.ts';
import { EmailGuruPluginSettingsTab } from './EmailGuruPluginSettingsTab.ts';
import { EmailServer, ImapConnection } from './email_server.ts';
import { ImapFlow } from 'imapflow';

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
    const file = this.app.vault.getFileByPath("Organization/Email.md") as TFile

    const server = new EmailServer(new ImapConnection(new ImapFlow({
      host: this.settings.host,
      port: this.settings.port,
      secure: true,
      auth: {
        user: this.settings.user,
        pass: this.settings.password,
      },
    })))

    const count = await server.inbox_count()

    this.app.vault.process(file, (data) => data.replace("^counts", `| ${new Date().toISOString().split(/T/)[0]} | ${count} |\n^counts`))
  }
}
