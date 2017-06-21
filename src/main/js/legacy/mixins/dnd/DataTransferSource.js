const Ext = require('extjs');


/**
 * Things that use this mixins, need to implement a getDataForTransfer
 * method to return the value to store in the dataTransfer
 *
 * They can also implement a getKeyForTransfer if they want
 */
module.exports = exports = Ext.define('NextThought.mixins.dnd.DataTransferSource', {
	/**
	 * Stringify the value of getDataForTransfer
	 * @return {String} value for the data transfer
	 */
	getDataTransferValue: function () {
		if (!this.getDataForTransfer) {
			console.error('DataTransferSource does not implement getDataForTransfer');
			return '';
		}

		var data = this.getDataForTransfer();

		return JSON.stringify(data);
	}
});
