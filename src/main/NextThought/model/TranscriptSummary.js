Ext.define('NextThought.model.TranscriptSummary', {
	extend: 'NextThought.model.Base',
	idProperty: 'RoomInfo.OID',
	fields: [
		{ name: 'RoomInfo', type: 'singleItem'},
		{ name: 'Contributors', type: 'auto' }
	]
});
