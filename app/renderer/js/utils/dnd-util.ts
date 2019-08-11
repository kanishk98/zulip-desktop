'use strict';

import ConfigUtil = require('./config-util');

// TODO: TypeScript - add to Setting interface
// the list of settings since we have fixed amount of them
// We want to do this by creating a new module that exports
// this interface
interface Setting {
	[key: string]: any;
}

interface Toggle {
	dnd: boolean;
	newSettings: Setting;
}

export async function toggle(): Promise<Toggle> {
	const dnd = !await ConfigUtil.getConfigItem('dnd', false);
	const dndSettingList = ['showNotification', 'silent'];
	if (process.platform === 'win32') {
		dndSettingList.push('flashTaskbarOnMessage');
	}

	let newSettings: Setting;
	if (dnd) {
		const oldSettings: Setting = {};
		newSettings = {};

		// Iterate through the dndSettingList.
		const oldSettingsUpdates = [];
		for (const settingName of dndSettingList) {
			// Store the current value of setting.
			oldSettingsUpdates.push(ConfigUtil.getConfigItem(settingName));
			// New value of setting.
			newSettings[settingName] = (settingName === 'silent');
		}

		await Promise.all(oldSettingsUpdates);

		// Store old value in oldSettings.
		ConfigUtil.setConfigItem('dndPreviousSettings', oldSettings);
	} else {
		newSettings = await ConfigUtil.getConfigItem('dndPreviousSettings');
	}

	for (const settingName of dndSettingList) {
		ConfigUtil.setConfigItem(settingName, newSettings[settingName]);
	}

	ConfigUtil.setConfigItem('dnd', dnd);
	return {dnd, newSettings};
}
