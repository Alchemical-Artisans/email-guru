import { Setting } from 'obsidian';
import { PluginSettingsTabBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsTabBase';

import type { EmailGuruPlugin } from './EmailGuruPlugin.ts';

export class EmailGuruPluginSettingsTab extends PluginSettingsTabBase<EmailGuruPlugin> {
  public override display(): void {
    this.containerEl.empty();

    new Setting(this.containerEl)
      .setName("Folder")
      .setDesc("Folder where retrieved email information is stored")
      .addText((text) =>
        this.bind(text, 'folder_path', {
          componentToPluginSettingsValueConverter: (uiValue: string) => uiValue,
          pluginSettingsToComponentValueConverter: (pluginSettingsValue: string) => pluginSettingsValue,
        }).setPlaceholder("Enter a value")
      )

    new Setting(this.containerEl)
      .setName('Host')
      .setDesc('IMAP host to connect to.')
      .addText((text) =>
        this.bind(text, 'host', {
          componentToPluginSettingsValueConverter: (uiValue: string) => uiValue,
          pluginSettingsToComponentValueConverter: (pluginSettingsValue: string) => pluginSettingsValue,
          valueValidator: (uiValue) => uiValue.length > 0 ? undefined : 'Value must be non-empty'
        })
          .setPlaceholder('Enter a value')
      );

    new Setting(this.containerEl)
      .setName('Port')
      .setDesc('IMAP port to communicate over.')
      .addText((text) =>
        this.bind(text, 'port', {
          componentToPluginSettingsValueConverter: (uiValue: string) => Number.parseInt(uiValue),
          pluginSettingsToComponentValueConverter: (pluginSettingsValue: number) => `${pluginSettingsValue}`,
          valueValidator: (uiValue) => uiValue.length > 0 ? undefined : 'Value must be non-empty'
        })
          .setPlaceholder('Enter a value')
      );

    new Setting(this.containerEl)
      .setName('User')
      .setDesc('Username used for authentication (usually your email address).')
      .addText((text) =>
        this.bind(text, 'user', {
          componentToPluginSettingsValueConverter: (uiValue: string) => uiValue,
          pluginSettingsToComponentValueConverter: (pluginSettingsValue: string) => pluginSettingsValue,
          valueValidator: (uiValue) => uiValue.length > 0 ? undefined : 'Value must be non-empty'
        })
          .setPlaceholder('Enter a value')
      );

    new Setting(this.containerEl)
      .setName('Password')
      .setDesc('Password used to log in (sometimes a separate passkey from your webmail login).')
      .addText((text) =>
        this.bind(text, 'password', {
          componentToPluginSettingsValueConverter: (uiValue: string) => uiValue,
          pluginSettingsToComponentValueConverter: (pluginSettingsValue: string) => pluginSettingsValue,
          valueValidator: (uiValue) => uiValue.length > 0 ? undefined : 'Value must be non-empty'
        })
          .setPlaceholder('Enter a value')
      );
  }
}
