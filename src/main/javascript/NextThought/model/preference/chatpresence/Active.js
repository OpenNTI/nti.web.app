Ext.define('NextThought.model.preference.chatpresence.Active',{
	extend: 'NextThought.model.preference.chatpresence.Base',

	getResourceUrl: function(){
		var base = this.callParent(arguments);

		return base + '/Active';
	}
});