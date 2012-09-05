Ext.define('NextThought.store.UserSearch',{
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.proxy.UserSearch'
	],

	model: 'NextThought.model.UserSearch',
	proxy: {
		type: 'usersearch',
		model: 'NextThought.model.UserSearch'
	},

	filters:[{
		fn: function(rec){
			return !isMe(rec);
		}
	},{
		fn: function(rec){
			return !rec.isEveryone || !rec.isEveryone();
		}
	}]
});
