import electron = require('electron');
let LevelDB: any = null;
let ipcRenderer: Electron.IpcRenderer = null;
if (process.type === 'browser') {
	LevelDB = require('../../../main/leveldb');
} else {
	ipcRenderer = electron.ipcRenderer;
}

class LevelDBUtil {
	initConfigUtil(): Promise<any> {
		return new Promise(resolve => {
			const settings = ipcRenderer.sendSync('get-settings');
			resolve(settings);
		});
	}

	initDomainUtil(): Promise<Domain[]> {
		return new Promise(resolve => {
			const domains = ipcRenderer.sendSync('get-domains');
			resolve(domains);
		});
	}

	setConfigItem(key: string, value: any): void {
		if (process.type === 'renderer') {
			const { ipcRenderer } = electron;
			ipcRenderer.send('db-set-item', key, value);
			return;
		}
		LevelDB.settings.setItem(key, value);
	}

	removeConfigItem(key: string): void {
		if (process.type === 'renderer') {
			const { ipcRenderer } = electron;
			ipcRenderer.send('db-delete-item', key);
			return;
		}
		LevelDB.settings.deleteItem(key);
	}

	setDomain(index: number, domain: Domain): void {
		
	}

	removeDomain(index: number): void {
		if (process.type === 'renderer') {
			const { ipcRenderer } = electron;
			ipcRenderer.send('db-delete-item', index.toString());
		}
	}
}

export = new LevelDBUtil();
