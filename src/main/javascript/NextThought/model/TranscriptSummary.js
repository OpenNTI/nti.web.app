Ext.define('NextThought.model.TranscriptSummary', {
	extend: 'NextThought.model.Base',

    requires: [
        'NextThought.model.converters.GroupByTime'
    ],

	fields: [
		{ name: 'RoomInfo', type: 'singleItem'},
		{ name: 'Contributors', type: 'auto' },

        { name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime'}
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
