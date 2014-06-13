Ext.define('NextThought.model.Badge', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'alignment', type: 'auto'},
		{name: 'criteria', type: 'string'},
		{name: 'description', type: 'string'},
		{name: 'image', type: 'string'},
		{name: 'issuer', type: 'string'},
		{name: 'name', type: 'string'},
		{name: 'tags', type: 'auto'},
		//properties for the ui
		{name: 'earnedCls', type: 'string', persist: false}
	]
});
