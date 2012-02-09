Ext.define('NextThought.model.TranscriptSummary', {
	extend: 'NextThought.model.Base',
	idProperty: 'RoomInfo.NTIID',//wish this worked...
	fields: [
		{ name: 'RoomInfo', type: 'singleItem'},
		{ name: 'Contributors', type: 'auto' }
	],

	getId: function(){
		try {
			return this.get('RoomInfo').getId();
		}
		catch(e){
			return null;
		}
	}
});
