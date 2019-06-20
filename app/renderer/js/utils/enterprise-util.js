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
	}

	reloadDB() {
		let enterpriseFile = '/etc/zulip-desktop-config/global_config.json';
		if (process.platform === 'win32') {
			enterpriseFile = 'C:\\Program Files\\Zulip-Desktop-Config\\global_config.json';
		}

		enterpriseFile = path.resolve(enterpriseFile);
		if (fs.existsSync(enterpriseFile)) {
			try {
				const file = fs.readFileSync(enterpriseFile, 'utf8');
				this.enterpriseSettings = JSON.parse(file);
			} catch (err) {
				logger.log('Error while JSON parsing global_config.json: ');
				logger.log(err);
			}
		}
	}

	getConfigItem(key, defaultValue = null) {
		this.reloadDB();
		return this.configItemExists(key) ? this.enterpriseSettings[key] : defaultValue;
	}

	configItemExists(key) {
		this.reloadDB();
		return (this.enterpriseSettings[key] !== undefined);
	}

	isPresetOrg(url) {
		if (!this.configItemExists('presetOrganizations')) {
			return false;
		}
		const presetOrgs = this.enterpriseSettings.presetOrganizations;
		for (const org in presetOrgs) {
			if (presetOrgs[org] === url) {
				return true;
			}
		}
		return false;
	}
}

module.exports = new EnterpriseUtil();
