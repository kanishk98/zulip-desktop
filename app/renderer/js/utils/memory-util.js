'use strict';
const { webFrame } = require('electron');

const Logger = require('./logger-util');

const logger = new Logger({
	file: `memory-util.log`,
	timestamp: true
});

let instance = null;

class MemoryUtil {
	constructor() {
		if (instance) {
			return instance;
		} else {
			instance = this;
		}
	}

	getMemory() {
		const memoryDetails = Object.entries(webFrame.getResourceUsage());
		logger.log('Object\tCount\tSize\tLiveSize');
		memoryDetails.forEach(stats => {
			function convertBytesToMB(bytes) {
				return (bytes / (1000.0 * 1000)).toFixed(2);
			}
			logger.log(stats[0] + '\t' + stats[1].count + '\t' + convertBytesToMB(stats[1].size) + 'MB\t', convertBytesToMB(stats[1].liveSize) + 'MB');
		});
	}

	startLogging(loggingInterval) {
		if (loggingInterval > 0) {
			setInterval(this.getMemory, loggingInterval);
		}
	}
}

module.exports = new MemoryUtil();
