'use strict';

const {ipcRenderer} = require('electron');

const BaseComponent = require(__dirname + '/../../components/base.js');
const EnterpriseUtil = require(__dirname + '/../../utils/enterprise-util.js');

class BaseSection extends BaseComponent {
	generateSettingOption(props) {
		const {$element, key, value, clickHandler} = props;

		$element.innerHTML = '';

		const $optionControl = this.generateNodeFromTemplate(this.generateOptionTemplate(value));
		$element.appendChild($optionControl);

		if (key !== undefined && EnterpriseUtil.isAdminOnly(key)) {
			$optionControl.getElementsByClassName('toggle')[0].classList.add('toggle-disabled');
			return;
		}

		$optionControl.addEventListener('click', clickHandler);
	}

	generateOptionTemplate(settingOption) {
		if (settingOption) {
			return `
				<div class="action">
					<div class="switch">
					  <input class="toggle toggle-round" type="checkbox" checked>
					  <label></label>
					</div>
				</div>
			`;
		} else {
			return `
				<div class="action">
					<div class="switch">
					  <input class="toggle toggle-round" type="checkbox">
					  <label></label>
					</div>
				</div>
			`;
		}
	}

	reloadApp() {
		ipcRenderer.send('forward-message', 'reload-viewer');
	}
}

module.exports = BaseSection;
