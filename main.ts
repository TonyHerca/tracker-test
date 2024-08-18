/* eslint-disable @typescript-eslint/no-unused-vars */
import { App, Editor, ItemView, MarkdownView, Modal, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf } from 'obsidian';
import HeatMapView from './HeatMapView.js';
import { get } from 'http';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

const MY_CUSTOM_VIEW_TYPE = 'my-custom-view'
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			MY_CUSTOM_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new MyCustomScreen(leaf)

		)

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('dice', 'Sample Ribbon Icon', () => {
			this.activateView();
		})

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text'); // streak possible?????????????????????????????

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-custom-view',
			name: 'Open custom view',
			callback: () => this.activateView()
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Bobby is my brother!');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});
	}
	
	async activateView() {
		this.app.workspace.detachLeavesOfType(MY_CUSTOM_VIEW_TYPE);

		await this.app.workspace.getLeaf(true).setViewState({
			type: MY_CUSTOM_VIEW_TYPE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(MY_CUSTOM_VIEW_TYPE)[0]
		)
	}


	onunload() {
		this.app.workspace.detachLeavesOfType(MY_CUSTOM_VIEW_TYPE);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MyCustomScreen extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}
	getViewType(): string {
		return MY_CUSTOM_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'My Custom Screen';
	}

	getDateData():Map <string, object> {
		const dates = new Map();
			const today = new Date();
			const filesMap = new Map();
				
			const files = this.app.vault.getMarkdownFiles().forEach((file:TFile) => {
				const date = file.basename.match(/\d{2}-\d{2}-\d{4}/);
				if (date) {
					filesMap.set(file.basename, file);
				}
			})
			console.log(`filesMap: ${filesMap}`)
			for (let i = 366; i >= 0; i--) {
				const date = new Date();
				date.setDate(today.getDate() - i);
				
				const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
				
				const year = date.getFullYear();
				const month = date.getMonth();
				const dayOfWeek = date.getDay();
				const dayOfMonth = date.getDate() - 1;
				const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
				const weekOfMonth = Math.floor((date.getDate() - 1 + startOfMonth.getDay()) / 7);
				const monthName = date.toLocaleString('default', { month: 'short' });
				let activity = 'none';
				
				if (filesMap.has(dateString)) {
					const file = filesMap.get(dateString);

					// check file metadata for activity and other stuff ofc
					activity = "low"
				}

				const monthKey = year.toString().substring(2) + month.toString().padStart(2, '0');
				
				if (!dates.has(monthKey)) {
					dates.set(monthKey, []);
				} 

				dates.get(monthKey).push({
					
					year: year,
					monthName: monthName,
					month: month,
					dayOfWeek: dayOfWeek,
					dayOfMonth: dayOfMonth,
					weekOfMonth: weekOfMonth,
					activity: activity
				});
			}
			console.log(dates)
			return dates;
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();
	
		// Custom UI elements
		// const header = container.createEl('h1', { text: 'My Custom View' });
		container.appendChild(HeatMapView(this.getDateData()));
		const dataContainer = container.createDiv({ cls: 'data-container' });

		// Example data or UI content
		dataContainer.createEl('p', { text: 'This is a custom screen inside Obsidian!' });
	
	}
	
	async onClose(): Promise<void> {
	// Clean up if necessary
	}

}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
} 

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
