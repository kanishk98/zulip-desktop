'use strict';
import electron = require('electron');
import path = require('path');
import level = require('level');
import Logger = require('./logger-util');

const { app } = electron.remote;

const logger = new Logger({
	file: 'leveldb-util.log',
	timestamp: true
});

const settingsJsonPath = path.join(app.getPath('userData'), 'config/settings/');
const domainsJsonPath = path.join(app.getPath('userData'), 'config/domains/');

class LevelDB {
	db: any;
	constructor(databasePath: string) {
		this.reloadDB(databasePath);
	}

	reloadDB(path: string): void {
		try {
			this.db = level(path, { valueEncoding: 'json' });
		} catch (err) {
			logger.error(err);
			logger.reportSentry(err.toString());
		}
	}

	async setItem(key: string, value: any): Promise<void> {
		try {
			return await this.db.put(key, value);
		} catch (err) {
			logger.error(err);
			logger.reportSentry(err.toString());
		}
	}

	async getItem(key: string, defaultValue: any = null): Promise<any> {
		try {
			return await this.db.get(key);
		} catch (err) {
			if (err instanceof level.errors.NotFoundError) {
				// key does not exist in database
				// no need to report this to Sentry
				await this.setItem(key, defaultValue);
			} else {
				logger.error(err);
				logger.reportSentry(err.toString());
			}
		}
	}

	async doesItemExist(key: string): Promise<boolean> {
		try {
			await this.db.get(key);
			// if control reaches here, key is present and accessible
			return true;
		} catch (err) {
			return false;
		}
	}

	async deleteItem(key: string): Promise<boolean> {
		try {
			return await this.db.del(key);
		} catch (err) {
			if (err instanceof level.errors.NotFoundError) {
				// key does not exist in database
				// no need to report this to Sentry
				return false;
			}
			logger.error(err);
			logger.reportSentry(err.toString());
			return false;
		}
	}
}

export = {
	settings: new LevelDB(settingsJsonPath),
	domains: new LevelDB(domainsJsonPath)
};
