'use strict';

const {ipcRenderer} = require('electron');

const BaseComponent = require(__dirname + '/../../components/base.js');

class BaseSection extends BaseComponent {
	generateSettingOption(props) {
		const {$element, value, clickHandler} = props;

		$element.innerHTML = '';

		const $optionControl = this.generateNodeFromTemplate(this.generateOptionTemplate(value));
		$element.appendChild($optionControl);

		$optionControl.addEventListener('click', clickHandler);
	}

	generateSettingDropdown(props) {
		const {$element, value, options, clickHandler} = props;

		$element.innerHTML = '';

		for (const option in options) {
			const $optionLang = this.generateNodeFromTemplate(this.generateDropdownOption(options[option], value));
			$element.appendChild($optionLang);
		}
		$element.addEventListener('change', clickHandler);
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

	generateDropdownOption(dropdownOption, value) {
		return `
			<option class='dropdown-option ${dropdownOption === value ? `selected' selected` : ''}' ${dropdownOption === value ? 'selected' : ''}>
				<button>${dropdownOption}</button>
			</div>
		`;
	}

	reloadApp() {
		ipcRenderer.send('forward-message', 'reload-viewer');
	}
}

module.exports = BaseSection;
