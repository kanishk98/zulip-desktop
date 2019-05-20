const fs = require('fs');
const path = require('path');

const Logger = require('./logger-util');

const logger = new Logger({
	file: 'enterpise-util.log',
	timestamp: true
});

let instance = null;

class EnterpriseUtil {

	constructor() {
		if (instance) {
			return instance;
		}
		instance = this;

		this.reloadDB();
		return instance;
	}

	reloadDB() {
		let enterpriseFile = '/etc/zulip-desktop-config/enterprise_config.json';
		if (process.platform === 'win32') {
			enterpriseFile = 'C:\\Program Files\\Zulip-Desktop-Config\\enterprise_config.json';
		}

		enterpriseFile = path.resolve(enterpriseFile);
		if (fs.existsSync(enterpriseFile)) {
			try {
				const file = fs.readFileSync(enterpriseFile, 'utf8');
				this.enterpriseSettings = JSON.parse(file);
			} catch (err) {
				logger.log('Error while JSON parsing enterprise_config.json: ');
				logger.log(err);
			}
		}
	}

	isAdminOnly(key) {
		this.reloadDB();
		if (this.configItemExists(key)) {
			return this.enterpriseSettings[key].isAdminOnly;
		}
		// if item does not exist, user can change setting
		return false;
	}

	getConfigItem(key, defaultValue = null) {
		this.reloadDB();
		return this.configItemExists(key) ? this.enterpriseSettings[key].value : defaultValue;
	}

	configItemExists(key) {
		this.reloadDB();
		return (this.enterpriseSettings[key] !== undefined);
	}
}

module.exports = new EnterpriseUtil();
