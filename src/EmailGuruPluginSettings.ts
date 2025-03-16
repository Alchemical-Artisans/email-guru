import { PluginSettingsBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsBase';

export class EmailGuruPluginSettings extends PluginSettingsBase {
  public host = "imap.gmail.com"
  public port = 993
  public user = ""
  public password = ""

  public constructor(data: unknown) {
    super();
    this.init(data);
  }
}
