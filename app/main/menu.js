'use strict';
const path = require('path');

const { app, shell, BrowserWindow, Menu, dialog } = require('electron');

const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const { appUpdater } = require('./autoupdater');

const ConfigUtil = require(__dirname + '/../renderer/js/utils/config-util.js');
const DNDUtil = require(__dirname + '/../renderer/js/utils/dnd-util.js');
const Logger = require(__dirname + '/../renderer/js/utils/logger-util.js');
const TranslationUtil = require(__dirname + '/../renderer/js/utils/translation-util.js');

const appName = app.getName();

const logger = new Logger({
	file: 'errors.log',
	timestamp: true
});

class AppMenu {
	getHistorySubmenu() {
		return [{
			label: TranslationUtil.__('Back', this.language),
			accelerator: process.platform === 'darwin' ? 'Command+Left' : 'Alt+Left',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('back');
				}
			}
		}, {
			label: TranslationUtil.__('Forward', this.language),
			accelerator: process.platform === 'darwin' ? 'Command+Right' : 'Alt+Right',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('forward');
				}
			}
		}];
	}

	getToolsSubmenu() {
		return [{
			label: TranslationUtil.__(`Check for Updates`, this.language),
			click() {
				AppMenu.checkForUpdate();
			}
		},
		{
			label: TranslationUtil.__(`Release Notes`, this.language),
			click() {
				shell.openExternal(`https://github.com/zulip/zulip-desktop/releases/tag/v${app.getVersion()}`);
			}
		}, {
			type: 'separator'
		}, {
			label: TranslationUtil.__('Factory Reset', this.language),
			accelerator: process.platform === 'darwin' ? 'Command+Shift+D' : 'Ctrl+Shift+D',
			click() {
				AppMenu.resetAppSettings();
			}
		}, {
			label: TranslationUtil.__('Download App Logs', this.language),
			click() {
				const zip = new AdmZip();
				let date = new Date();
				date = date.toLocaleDateString().replace(/\//g, '-');

				// Create a zip file of all the logs and config data
				zip.addLocalFolder(`${app.getPath('appData')}/${appName}/Logs`);
				zip.addLocalFolder(`${app.getPath('appData')}/${appName}/config`);

				// Put the log file in downloads folder
				const logFilePath = `${app.getPath('downloads')}/Zulip-logs-${date}.zip`;
				zip.writeZip(logFilePath);

				// Open and select the log file
				shell.showItemInFolder(logFilePath);
			}
		}, {
			type: 'separator'
		}, {
			label: TranslationUtil.__('Toggle DevTools for Zulip App', this.language),
			accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
			click(item, focusedWindow) {
				if (focusedWindow) {
					focusedWindow.webContents.toggleDevTools();
				}
			}
		}, {
			label: TranslationUtil.__('Toggle DevTools for Active Tab', this.language),
			accelerator: process.platform === 'darwin' ? 'Alt+Command+U' : 'Ctrl+Shift+U',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('tab-devtools');
				}
			}
		}];
	}

	getViewSubmenu() {
		return [{
			label: TranslationUtil.__('Reload', this.language),
			accelerator: 'CommandOrControl+R',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('reload-current-viewer');
				}
			}
		}, {
			label: TranslationUtil.__('Hard Reload', this.language),
			accelerator: 'CommandOrControl+Shift+R',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('hard-reload');
				}
			}
		}, {
			type: 'separator'
		}, {
			label: TranslationUtil.__('Toggle Full Screen', this.language),
			role: 'togglefullscreen'
		}, {
			label: TranslationUtil.__('Zoom In', this.language),
			accelerator: process.platform === 'darwin' ? 'Command+Plus' : 'Control+=',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('zoomIn');
				}
			}
		}, {
			label: TranslationUtil.__('Zoom Out', this.language),
			accelerator: 'CommandOrControl+-',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('zoomOut');
				}
			}
		}, {
			label: TranslationUtil.__('Actual Size', this.language),
			accelerator: 'CommandOrControl+0',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('zoomActualSize');
				}
			}
		}, {
			type: 'separator'
		}, {
			label: TranslationUtil.__('Toggle Tray Icon', this.language),
			click(item, focusedWindow) {
				if (focusedWindow) {
					focusedWindow.webContents.send('toggletray');
				}
			}
		}, {
			label: TranslationUtil.__('Toggle Sidebar', this.language),
			accelerator: 'CommandOrControl+Shift+S',
			click(item, focusedWindow) {
				if (focusedWindow) {
					const newValue = !ConfigUtil.getConfigItem('showSidebar');
					focusedWindow.webContents.send('toggle-sidebar', newValue);
					ConfigUtil.setConfigItem('showSidebar', newValue);
				}
			}
		}, {
			label: 'Auto hide Menu bar',
			checked: ConfigUtil.getConfigItem('autoHideMenubar', false),
			visible: process.platform !== 'darwin',
			click(item, focusedWindow) {
				if (focusedWindow) {
					const newValue = !ConfigUtil.getConfigItem('autoHideMenubar');
					focusedWindow.setAutoHideMenuBar(newValue);
					focusedWindow.setMenuBarVisibility(!newValue);
					focusedWindow.webContents.send('toggle-autohide-menubar', newValue);
					ConfigUtil.setConfigItem('autoHideMenubar', newValue);
				}
			},
			type: 'checkbox'
		}];
	}

	getHelpSubmenu() {
		return [
			{
				label: `${appName + ' Desktop'} v${app.getVersion()}`,
				enabled: false
			},
			{
				label: TranslationUtil.__('About Zulip', this.language),
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('open-about');
					}
				}
			},
			{
				label: TranslationUtil.__(`Help Center`),
				click(focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('open-help');
					}
				}
			}, {
				label: TranslationUtil.__('Report an Issue'),
				click() {
					// the goal is to notify the main.html BrowserWindow
					// which may not be the focused window.
					BrowserWindow.getAllWindows().forEach(window => {
						window.webContents.send('open-feedback-modal');
					});
				}
			}];
	}

	getWindowSubmenu(tabs, activeTabIndex) {
		const initialSubmenu = [{
			label: TranslationUtil.__('Minimize', this.language),
			role: 'minimize'
		}, {
			label: TranslationUtil.__('Close', this.language),
			role: 'close'
		}];

		if (tabs.length > 0) {
			const ShortcutKey = process.platform === 'darwin' ? 'Cmd' : 'Ctrl';
			initialSubmenu.push({
				type: 'separator'
			});
			for (let i = 0; i < tabs.length; i++) {
				// Do not add functional tab settings to list of windows in menu bar
				if (tabs[i].props.role === 'function' && tabs[i].webview.props.name === 'Settings') {
					continue;
				}

				initialSubmenu.push({
					label: tabs[i].webview.props.name,
					accelerator: tabs[i].props.role === 'function' ? '' : `${ShortcutKey} + ${tabs[i].props.index + 1}`,
					checked: tabs[i].props.index === activeTabIndex,
					click(item, focusedWindow) {
						if (focusedWindow) {
							AppMenu.sendAction('switch-server-tab', tabs[i].props.index);
						}
					},
					type: 'checkbox'
				});
			}
			initialSubmenu.push({
				type: 'separator'
			});
			initialSubmenu.push({
				label: TranslationUtil.__('Switch to Next Organization', this.language),
				accelerator: `Ctrl+Tab`,
				enabled: tabs[activeTabIndex].props.role === 'server',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('switch-server-tab', AppMenu.getNextServer(tabs, activeTabIndex));
					}
				}
			}, {
				label: TranslationUtil.__('Switch to Previous Organization', this.language),
				accelerator: `Ctrl+Shift+Tab`,
				enabled: tabs[activeTabIndex].props.role === 'server',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('switch-server-tab', AppMenu.getPreviousServer(tabs, activeTabIndex));
					}
				}
			});
		}

		return initialSubmenu;
	}

	getDarwinTpl(props) {
		const { tabs, activeTabIndex, enableMenu } = props;

		return [{
			label: `${app.getName()}`,
			submenu: [{
				label: TranslationUtil.__('Add Organization', this.language),
				accelerator: 'Cmd+Shift+N',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('new-server');
					}
				}
			}, {
				label: TranslationUtil.__('Toggle Do Not Disturb', this.language),
				accelerator: 'Cmd+Shift+M',
				click() {
					const dndUtil = DNDUtil.toggle();
					AppMenu.sendAction('toggle-dnd', dndUtil.dnd, dndUtil.newSettings);
				}
			}, {
				label: TranslationUtil.__('Desktop Settings', this.language),
				accelerator: 'Cmd+,',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('open-settings', this.language);
					}
				}
			}, {
				label: TranslationUtil.__('Keyboard Shortcuts', this.language),
				accelerator: 'Cmd+Shift+K',
				enabled: enableMenu,
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('shortcut');
					}
				}
			}, {
				type: 'separator'
			}, {
				label: TranslationUtil.__('Copy Zulip URL', this.language),
				accelerator: 'Cmd+Shift+C',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('copy-zulip-url');
					}
				}
			}, {
				label: TranslationUtil.__('Log Out of Organization', this.language),
				accelerator: 'Cmd+L',
				enabled: enableMenu,
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('log-out');
					}
				}
			}, {
				type: 'separator'
			}, {
				label: TranslationUtil.__('Services', this.language),
				role: 'services',
				submenu: []
			}, {
				type: 'separator'
			}, {
				label: TranslationUtil.__('Hide', this.language),
				role: 'hide'
			}, {
				label: TranslationUtil.__('Hide Others', this.language),
				role: 'hideothers'
			}, {
				label: TranslationUtil.__('Unhide', this.language),
				role: 'unhide'
			}, {
				type: 'separator'
			}, {
				label: TranslationUtil.__('Minimize', this.language),
				role: 'minimize'
			}, {
				label: TranslationUtil.__('Close', this.language),
				role: 'close'
			}, {
				label: TranslationUtil.__('Quit', this.language),
				role: 'quit'
			}]
		}, {
			label: TranslationUtil.__('Edit', this.language),
			submenu: [{
				label: TranslationUtil.__('Undo', this.language),
				role: 'undo'
			}, {
				label: TranslationUtil.__('Redo', this.language),
				role: 'redo'
			}, {
				type: 'separator'
			}, {
				label: TranslationUtil.__('Cut', this.language),
				role: 'cut'
			}, {
				label: TranslationUtil.__('Copy', this.language),
				role: 'copy'
			}, {
				label: TranslationUtil.__('Paste', this.language),
				role: 'paste'
			}, {
				label: TranslationUtil.__('Paste and Match Style', this.language),
				role: 'pasteandmatchstyle'
			}, {
				label: TranslationUtil.__('Select All', this.language),
				role: 'selectall'
			}]
		}, {
			label: TranslationUtil.__('View', this.language),
			submenu: this.getViewSubmenu()
		}, {
			label: TranslationUtil.__('History', this.language),
			submenu: this.getHistorySubmenu()
		}, {
			label: TranslationUtil.__('Window', this.language),
			submenu: this.getWindowSubmenu(tabs, activeTabIndex)
		}, {
			label: TranslationUtil.__('Tools', this.language),
			submenu: this.getToolsSubmenu()
		}, {
			label: TranslationUtil.__('Help', this.language),
			role: 'help',
			submenu: this.getHelpSubmenu()
		}];
	}

	getOtherTpl(props) {
		const { tabs, activeTabIndex, enableMenu } = props;
		return [{
			label: TranslationUtil.__('File', this.language),
			submenu: [{
				label: TranslationUtil.__('Add Organization', this.language),
				accelerator: 'Ctrl+Shift+N',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('new-server');
					}
				}
			}, {
				type: 'separator'
			}, {
				label: TranslationUtil.__('Toggle Do Not Disturb', this.language),
				accelerator: 'Ctrl+Shift+M',
				click() {
					const dndUtil = DNDUtil.toggle();
					AppMenu.sendAction('toggle-dnd', dndUtil.dnd, dndUtil.newSettings);
				}
			}, {
				label: TranslationUtil.__('Desktop Settings', this.language),
				accelerator: 'Ctrl+,',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('open-settings');
					}
				}
			}, {
				label: TranslationUtil.__('Keyboard Shortcuts', this.language),
				accelerator: 'Ctrl+Shift+K',
				enabled: enableMenu,
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('shortcut');
					}
				}
			}, {
				type: 'separator'
			}, {
				label: TranslationUtil.__('Copy Zulip URL', this.language),
				accelerator: 'Ctrl+Shift+C',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('copy-zulip-url');
					}
				}
			}, {
				label: TranslationUtil.__('Log Out of Organization', this.language),
				accelerator: 'Ctrl+L',
				enabled: enableMenu,
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('log-out');
					}
				}
			}, {
				type: 'separator'
			}, {
				label: TranslationUtil.__('Minimize', this.language),
				role: 'minimize'
			}, {
				label: TranslationUtil.__('Close', this.language),
				role: 'close'
			}, {
				label: TranslationUtil.__('Quit', this.language),
				role: 'quit',
				accelerator: 'Ctrl+Q'
			}]
		}, {
			label: TranslationUtil.__('Edit', this.language),
			submenu: [{
				label: TranslationUtil.__('Undo', this.language),
				role: 'undo'
			}, {
				label: TranslationUtil.__('Redo', this.language),
				role: 'redo'
			}, {
				type: 'separator'
			}, {
				label: TranslationUtil.__('Cut', this.language),
				role: 'cut'
			}, {
				label: TranslationUtil.__('Copy', this.language),
				role: 'copy'
			}, {
				label: TranslationUtil.__('Paste', this.language),
				role: 'paste'
			}, {
				label: TranslationUtil.__('Paste and Match Style', this.language),
				role: 'pasteandmatchstyle'
			}, {
				type: 'separator'
			}, {
				label: TranslationUtil.__('Select All', this.language),
				role: 'selectall'
			}]
		}, {
			label: TranslationUtil.__('View', this.language),
			submenu: this.getViewSubmenu()
		}, {
			label: TranslationUtil.__('History', this.language),
			submenu: this.getHistorySubmenu()
		}, {
			label: TranslationUtil.__('Window', this.language),
			submenu: this.getWindowSubmenu(tabs, activeTabIndex)
		}, {
			label: TranslationUtil.__('Tools', this.language),
			submenu: this.getToolsSubmenu()
		}, {
			label: TranslationUtil.__('Help', this.language),
			role: 'help',
			submenu: this.getHelpSubmenu()
		}];
	}

	static sendAction(action, ...params) {
		const win = BrowserWindow.getAllWindows()[0];

		if (process.platform === 'darwin') {
			win.restore();
		}

		win.webContents.send(action, ...params);
	}

	static checkForUpdate() {
		appUpdater(true);
	}

	static getNextServer(tabs, activeTabIndex) {
		do {
			activeTabIndex = (activeTabIndex + 1) % tabs.length;
		}
		while (tabs[activeTabIndex].props.role !== 'server');
		return activeTabIndex;
	}

	static getPreviousServer(tabs, activeTabIndex) {
		do {
			activeTabIndex = (activeTabIndex - 1 + tabs.length) % tabs.length;
		}
		while (tabs[activeTabIndex].props.role !== 'server');
		return activeTabIndex;
	}

	static resetAppSettings() {
		const resetAppSettingsMessage = 'By proceeding you will be removing all connected organizations and preferences from Zulip.';

		// We save App's settings/configurations in following files
		const settingFiles = ['config/window-state.json', 'config/domain.json', 'config/settings.json', 'config/certificates.json'];

		dialog.showMessageBox({
			type: 'warning',
			buttons: ['YES', 'NO'],
			defaultId: 0,
			message: 'Are you sure?',
			detail: resetAppSettingsMessage
		}, response => {
			if (response === 0) {
				settingFiles.forEach(settingFileName => {
					const getSettingFilesPath = path.join(app.getPath('appData'), appName, settingFileName);
					fs.access(getSettingFilesPath, error => {
						if (error) {
							logger.error('Error while resetting app settings.');
							logger.error(error);
						} else {
							fs.unlink(getSettingFilesPath, () => {
								AppMenu.sendAction('clear-app-data');
							});
						}
					});
				});
			}
		});
	}

	setMenu(props) {
		this.language = props.language ? props.language : 'en';
		const tpl = process.platform === 'darwin' ? this.getDarwinTpl(props) : this.getOtherTpl(props);
		const menu = Menu.buildFromTemplate(tpl);
		Menu.setApplicationMenu(menu);
	}
}

module.exports = new AppMenu();
