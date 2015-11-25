Ext.define('NextThought.mixins.dnd.DataTransferSource', {
	getDataTransferValue: function() {
		if (!this.getDataForTransfer) {
			console.error('DataTransferSource does not implement getDataForTransfer');
			return '';
		}

		var data = this.getDataForTransfer();

		return JSON.stringify();
	}
});
