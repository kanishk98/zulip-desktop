'use strict';
import LevelDB = require('./leveldb-util');
import Logger = require('./logger-util');
import EnterpriseUtil = require('./enterprise-util');

const logger = new Logger({
	file: 'config-util.log',
	timestamp: true
});

let instance: null | ConfigUtil = null;

class ConfigUtil {
	db: any;

	constructor() {
		if (instance) {
			return instance;
		} else {
			this.db = LevelDB.settings;
			instance = this;
		}
	}

	async getConfigItem(key: string, defaultValue: any = null): Promise<any> {
		try {
			return this.db.getItem(key, defaultValue);
		} catch (err) {
			logger.error(err);
		}
	}

	// This function returns whether a key exists in the configuration file (settings.json)
	async isConfigItemExists(key: string): Promise<boolean> {
		try {
			return await this.db.doesItemExist(key);
		} catch (err) {
			logger.error(err);
			return false;
		}
	}

	async setConfigItem(key: string, value: any, override? : boolean): Promise<void> {
		if (EnterpriseUtil.configItemExists(key) && !override) {
			// if item is in global config and we're not trying to override
			return;
		}
		await this.db.setItem(key, value);
	}

	async removeConfigItem(key: string): Promise<void> {
		await this.db.deleteItem(key);
	}
}

export = new ConfigUtil();
