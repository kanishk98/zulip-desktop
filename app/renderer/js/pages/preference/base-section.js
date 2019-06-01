'use strict';

const {ipcRenderer} = require('electron');

const BaseComponent = require(__dirname + '/../../components/base.js');

class BaseSection extends BaseComponent {
	generateSettingOption(props) {
		const { $element, disabled, value, clickHandler } = props;

		$element.innerHTML = '';

		const $optionControl = this.generateNodeFromTemplate(this.generateOptionTemplate(value, disabled));
		$element.appendChild($optionControl);

		$optionControl.addEventListener('click', clickHandler);
	}

	generateSettingDropdown(props) {
		const { $element, disabled, value, options, clickHandler } = props;

		$element.innerHTML = '';

		for (const option in options) {
			if (!options[option]) {
				// language not identified by locale-code
				continue;
			}
			const $optionLang = this.generateNodeFromTemplate(this.generateDropdownOption(options[option], value));
			$element.appendChild($optionLang);
		}
		$element.addEventListener('change', clickHandler);
		switch (disabled()) {
			case null:
				$element.removeAttribute('disabled');
				$element.classList.remove('turned-off', 'disallowed');
				break;
			case 'soft':
				$element.removeAttribute('disabled');
				$element.classList.remove('disallowed');
				$element.classList.add('turned-off');
				break;
			case 'hard':
				$element.classList.add('turned-off', 'disallowed');
				$element.setAttribute('disabled', true);
				break;
			default:
		}
	}

	generateSwitchLabel(disabled) {
		if (disabled) {
			return `<label class="disallowed"/>`;
		}
		return `<label/>`;
	}

	generateOptionTemplate(settingOption, disabled) {
		const label = this.generateSwitchLabel(disabled);
		if (settingOption) {
			return `
				<div class="action">
					<div class="switch">
					  <input class="toggle toggle-round" type="checkbox" checked>
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
