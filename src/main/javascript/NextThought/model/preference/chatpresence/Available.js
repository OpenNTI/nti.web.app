Ext.define('NextThought.model.preference.chatpresence.Available',{
	extend: 'NextThought.model.preference.chatpresence.Base',

	getResourceUrl: function(){
		var base = this.callParent(arguments);

		return base + '/Available';
	}
});