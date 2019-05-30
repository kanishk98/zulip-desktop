'use strict';

const { SpellCheckHandler, ContextMenuListener, ContextMenuBuilder } = require('electron-spellchecker');

const ConfigUtil = require(__dirname + '/utils/config-util.js');
const Logger = require(__dirname + '/utils/logger-util.js');

const logger = new Logger({
	file: 'errors.log',
	timestamp: true
});

class SetupSpellChecker {
	init(serverLanguage) {
		if (ConfigUtil.getConfigItem('enableSpellchecker')) {
			this.enableSpellChecker();
		}
		this.enableContextMenu(serverLanguage);
	}

	enableSpellChecker() {
		try {
			this.SpellCheckHandler = new SpellCheckHandler();
		} catch (err) {
			logger.error(err);
		}
	}

	enableContextMenu(serverLanguage) {
		if (this.SpellCheckHandler) {
			this.SpellCheckHandler.attachToInput();
			const useCustomLanguage = ConfigUtil.getConfigItem('useCustomLanguage', false);
			const useServerLanguage = ConfigUtil.getConfigItem('useServerLanguage', false);
			if (useCustomLanguage) {
				this.SpellCheckHandler.currentSpellcheckerChanged.subscribe(() => {
					this.SpellCheckHandler.switchLanguage(ConfigUtil.getConfigItem('spellcheckerLanguage', 'en-US'));
				});
			} else if (useServerLanguage && serverLanguage) {
				this.SpellCheckHandler.currentSpellcheckerChanged.subscribe(() => {
					this.SpellCheckHandler.switchLanguage(serverLanguage);
				});
			} else {
				this.SpellCheckHandler.currentSpellcheckerChanged.subscribe(() => {
					this.SpellCheckHandler.switchLanguage(this.SpellCheckHandler.currentSpellcheckerLanguage);
				});
			}
		}

		const contextMenuBuilder = new ContextMenuBuilder(this.SpellCheckHandler);
		this.contextMenuListener = new ContextMenuListener(info => {
			contextMenuBuilder.showPopupMenu(info);
		});
	}

	unsubscribeSpellChecker() {
		// eslint-disable-next-line no-undef
		if (this.SpellCheckHandler) {
			this.SpellCheckHandler.unsubscribe();
		}
		if (this.contextMenuListener) {
			this.contextMenuListener.unsubscribe();
		}
	}
}

module.exports = new SetupSpellChecker();
