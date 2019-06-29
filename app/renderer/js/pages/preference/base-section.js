'use strict';

const {ipcRenderer} = require('electron');

const BaseComponent = require(__dirname + '/../../components/base.js');

class BaseSection extends BaseComponent {
	generateSettingOption(props) {
		const {$element, disabled, value, clickHandler} = props;

		$element.innerHTML = '';

		const $optionControl = this.generateNodeFromTemplate(this.generateOptionTemplate(value, disabled));
		$element.appendChild($optionControl);
		if (!disabled) {
			$optionControl.addEventListener('click', clickHandler);
		}
	}

	generateOptionTemplate(settingOption, disabled) {
		const label = disabled ? `<label class="disallowed" title="Setting locked by admin."/>` : `<label/>`;
		if (settingOption) {
			return `
				<div class="action">
					<div class="switch">
					  <input class="toggle toggle-round" type="checkbox" checked disabled>
					  ${label}
					</div>
				</div>
			`;
		} else {
			return `
				<div class="action">
					<div class="switch">
					  <input class="toggle toggle-round" type="checkbox">
					  ${label}
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
