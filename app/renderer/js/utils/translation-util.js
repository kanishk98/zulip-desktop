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

	__(phrase, locale) {
		return i18n.__({ phrase, locale: (locale ? locale : 'en') });
	}
}

module.exports = new TranslationUtil();
