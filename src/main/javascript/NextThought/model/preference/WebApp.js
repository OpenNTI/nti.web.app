Ext.define('NextThought.model.preference.WebApp',{
	extend: 'NextThought.model.preference.Base',

	fields:[
		{name: 'preferFlashVideo', type: 'bool'}
	],

	getResourceUrl: function(){
		var base = this.callParent(arguments);

		return base + '/WebApp';
	}
});