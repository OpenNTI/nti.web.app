Ext.define('NextThought.model.TranscriptSummary', {
	extend: 'NextThought.model.Base',
	fields: [
		{ name: 'RoomInfo', type: 'singleItem'},
		{ name: 'Contributors', type: 'auto' }
	],

//	isThreadable: true,

	getId: function(){
		try {
			return this.get('RoomInfo').getId();
		}
		catch(e){
			return null;
		}
	}
});
