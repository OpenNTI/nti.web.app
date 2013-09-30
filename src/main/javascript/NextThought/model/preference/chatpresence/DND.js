Ext.define('NextThought.model.preference.chatpresence.DND',{
	extend: 'NextThought.model.preference.chatpresence.Base',

	getResourceUrl: function(){
		var base = this.callParent(arguments);

		return base + '/DND';
	}
});