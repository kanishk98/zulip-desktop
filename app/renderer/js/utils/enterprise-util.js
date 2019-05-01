const fs = require('fs');
const process = require('process');

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
		let enterpriseJsonPath = null;
		if (process.platform === 'win32') {
			enterpriseJsonPath = 'C:\\Program Files\\Zulip-Desktop-Config\\enterprise_config.json';
		} else {
			enterpriseJsonPath = '/etc/zulip-desktop-config/enterprise_config.json';
		}
		try {
			const file = fs.readFileSync(enterpriseJsonPath, 'utf8');
			this.enterpriseSettings = JSON.parse(file);
		} catch (err) {
			logger.log('Error while JSON parsing enterprise_config.json: ');
			logger.log(err);
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
		const {value} = this.enterpriseSettings[key] || {value: defaultValue};
		return value;
	}

	configItemExists(key) {
		this.reloadDB();
		const value = this.enterpriseSettings[key];
		return (value !== undefined);
	}
}

module.exports = new EnterpriseUtil();
