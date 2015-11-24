Ext.define('NextThought.model.VideoRollItem', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'id', type: 'string', mapping: 'ntiid'},
		{name: 'date', type: 'date' },
		{name: 'label', type: 'string'},
		{name: 'poster', type: 'string'},
		{name: 'thumb', type: 'string'},
		{name: 'comments', type: 'auto'},
		{name: 'slidedeck', type: 'string', persist: false},
		{name: 'hasTranscripts', type: 'boolean', persist: false},
		{name: 'viewedCls', type: 'string', persist: false},
		{name: 'viewed', type: 'boolean', persist: false}
	]

});
