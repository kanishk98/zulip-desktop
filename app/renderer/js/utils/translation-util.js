'use strict';

const path = require('path');
const i18n = require('i18n');

let instance = null;

class TranslationUtil {
	constructor() {
		if (instance) {
			return this;
		}
		instance = this;
		i18n.configure({
			directory: path.join(__dirname, '../../../translations/'),
			register: this
		});
	}

	refreshLocale(locale) {
		i18n.setLocale(this, locale);
	}

	__(phrase) {
		return i18n.__(phrase);
	}
}

module.exports = new TranslationUtil();
