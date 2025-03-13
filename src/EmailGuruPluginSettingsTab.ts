import { Setting } from 'obsidian';
import { PluginSettingsTabBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsTabBase';

import type { EmailGuruPlugin } from './EmailGuruPlugin.ts';

export class EmailGuruPluginSettingsTab extends PluginSettingsTabBase<EmailGuruPlugin> {
  public override display(): void {
    this.containerEl.empty();

    new Setting(this.containerEl)
      .setName('Test Setting')
      .setDesc('This is a test setting.')
      .addText((text) =>
        this.bind(text, 'testSetting', {
          componentToPluginSettingsValueConverter: (uiValue: string) => uiValue.replace(' (converted)', ''),
          onChanged: () => {
            this.display();
          },
          pluginSettingsToComponentValueConverter: (pluginSettingsValue: string) => `${pluginSettingsValue} (converted)`,
          valueValidator: (uiValue) => uiValue.length > 0 ? undefined : 'Value must be non-empty'
        })
          .setPlaceholder('Enter a value')
      );
  }
}
