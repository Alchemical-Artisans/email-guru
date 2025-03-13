import type {
  Editor,
  MarkdownPostProcessorContext,
  ObsidianProtocolData,
  TAbstractFile,
  WorkspaceLeaf
} from 'obsidian';

import {
  MarkdownView,
  Notice,
  PluginSettingTab
} from 'obsidian';
import { getDebugger } from 'obsidian-dev-utils/Debug';
import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import { EmailGuruPluginSettings } from './EmailGuruPluginSettings.ts';
import { EmailGuruPluginSettingsTab } from './EmailGuruPluginSettingsTab.ts';
import { sampleStateField } from './EditorExtensions/SampleStateField.ts';
import { sampleViewPlugin } from './EditorExtensions/SampleViewPlugin.ts';
import { SampleEditorSuggest } from './EditorSuggests/SampleEditorSuggest.ts';
import { SampleModal } from './Modals/SampleModal.ts';
import {
  SAMPLE_VIEW_TYPE,
  SampleView
} from './Views/SampleView.ts';

export class EmailGuruPlugin extends PluginBase<EmailGuruPluginSettings> {
  protected override createPluginSettings(data: unknown): EmailGuruPluginSettings {
    return new EmailGuruPluginSettings(data);
  }

  protected override createPluginSettingsTab(): null | PluginSettingTab {
    return new EmailGuruPluginSettingsTab(this);
  }

  protected override async onLayoutReady(): Promise<void> {
    new Notice('This is executed after all plugins are loaded');
    await this.openSampleView();
  }

  protected override onloadComplete(): void {
    this.addCommand({
      callback: this.runSampleCommand.bind(this),
      id: 'sample-command',
      name: 'Sample command'
    });

    this.addCommand({
      editorCallback: this.runSampleEditorCommand.bind(this),
      id: 'sample-editor-command',
      name: 'Sample editor command'
    });

    this.addCommand({
      checkCallback: this.runSampleCommandWithCheck.bind(this),
      id: 'sample-command-with-check',
      name: 'Sample command with check'
    });

    this.addRibbonIcon('dice', 'Sample ribbon icon', this.runSampleRibbonIconCommand.bind(this));

    this.addStatusBarItem().setText('Sample status bar item');

    this.registerDomEvent(document, 'dblclick', this.handleSampleDomEvent.bind(this));

    this.registerEditorExtension([sampleViewPlugin, sampleStateField]);

    this.registerEditorSuggest(new SampleEditorSuggest(this.app));

    this.registerEvent(this.app.vault.on('create', this.handleSampleEvent.bind(this)));

    this.registerExtensions(['sample-extension-1', 'sample-extension-2'], SAMPLE_VIEW_TYPE);

    this.registerHoverLinkSource(SAMPLE_VIEW_TYPE, {
      defaultMod: true,
      display: this.manifest.name
    });

    const INTERVAL_IN_MILLISECONDS = 60_000;
    this.registerInterval(window.setInterval(this.handleSampleIntervalTick.bind(this), INTERVAL_IN_MILLISECONDS));

    this.registerMarkdownCodeBlockProcessor('sample-code-block-processor', this.handleSampleCodeBlockProcessor.bind(this));

    this.registerMarkdownPostProcessor(this.handleSampleMarkdownPostProcessor.bind(this));

    this.registerObsidianProtocolHandler('sample-action', this.handleSampleObsidianProtocolHandler.bind(this));

    this.registerView(SAMPLE_VIEW_TYPE, (leaf) => new SampleView(leaf));
  }

  private handleSampleCodeBlockProcessor(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    getDebugger('handleSampleCodeBlockProcessor')(source, el, ctx);
    el.setText('Sample code block processor');
  }

  private handleSampleDomEvent(evt: MouseEvent): void {
    const tagName = evt.target instanceof HTMLElement ? evt.target.tagName : '';
    new Notice(`Sample DOM event: ${tagName}`);
  }

  private handleSampleEvent(file: TAbstractFile): void {
    new Notice(`Sample event: ${file.name}`);
  }

  private handleSampleIntervalTick(): void {
    new Notice('Sample interval tick');
  }

  private handleSampleMarkdownPostProcessor(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    getDebugger('handleSampleMarkdownPostProcessor')(el, ctx);
    if (el.hasClass('el-h6')) {
      el.setText('Sample markdown post processor');
    }
  }

  private handleSampleObsidianProtocolHandler(params: ObsidianProtocolData): void {
    new Notice(`Sample obsidian protocol handler: ${params.action}`);
  }

  private async openSampleView(): Promise<void> {
    const { workspace } = this.app;

    let leaf: null | WorkspaceLeaf;
    const leaves = workspace.getLeavesOfType(SAMPLE_VIEW_TYPE);

    if (leaves.length > 0) {
      leaf = leaves[0] ?? null;
    } else {
      leaf = workspace.getRightLeaf(false);
      await leaf?.setViewState({ active: true, type: SAMPLE_VIEW_TYPE });
    }

    if (leaf) {
      await workspace.revealLeaf(leaf);
    }
  }

  private runSampleCommand(): void {
    new Notice('Sample command');
  }

  private runSampleCommandWithCheck(checking: boolean): boolean {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return false;
    }

    if (!checking) {
      new SampleModal(this.app).open();
    }

    return true;
  }

  private runSampleEditorCommand(editor: Editor): void {
    editor.replaceSelection('Sample Editor Command');
  }

  private runSampleRibbonIconCommand(): void {
    new Notice('Sample ribbon icon command');
  }
}
