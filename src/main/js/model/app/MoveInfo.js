Ext.define('NextThought.model.app.MoveInfo', {
	extend: 'NextThought.model.Base',

	mimeType: 'application/vnd.nextthought.app.moveinfo',

	mixins: {
		DataTransfer: 'NextThought.mixins.dnd.DataTransferSource'
	},


	fields: [
		{name: 'OriginContainer', type: 'string'},
		{name: 'OriginIndex', type: 'string'}
	],


	getDataForTransfer: function() {
		return {
			MimeType: this.mimeType,
			OriginContainer: this.get('OriginContainer'),
			OriginIndex: this.get('OriginIndex')
		};
	},


	getIndex: function() {
		var index = this.get('OriginIndex');

		return parseInt(index, 10);
	}
});
