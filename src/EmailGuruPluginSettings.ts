import { PluginSettingsBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsBase';
import { Path } from './path.ts';

export class EmailGuruPluginSettings extends PluginSettingsBase {
  public folder_path = "Email"
  public host = "imap.gmail.com"
  public port = 993
  public user = ""
  public password = ""

  public constructor(data: unknown) {
    super();
    this.init(data);
  }

  get folder() {
    return new Path(this.folder_path)
  }
}
