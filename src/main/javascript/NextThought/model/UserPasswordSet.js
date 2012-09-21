Ext.define('NextThought.model.UserPasswordSet',{
	extend: 'Ext.data.Model',
	requires: [
		'NextThought.mixins.HasLinks',
		'NextThought.model.converters.Links',
		'NextThought.model.User',
		'NextThought.proxy.Rest',
		'NextThought.util.Parsing'
	],
	mixins: {
		hasLinks: 'NextThought.mixins.HasLinks'
	},

	mimeType: 'application/vnd.nextthought.user',
	proxy: { type: 'nti' },
	fields: [
		{ name: 'Links', type: 'links', persist: false, defaultValue: [] },
		{ name: 'old_password', type:'string' },
		{ name: 'password', type:'string' }
	],

	save: function(ops){

		Ext.Ajax.request(Ext.apply({
			url: this.getLink('edit')+'/++fields++password',
			method: 'PUT',
			jsonData: this.getData()
		},ops));

	},

	statics : {
		fromUser: function(user){
			return this.create( {Links: Ext.clone($AppConfig.userObject.raw.Links)}, user.get('Username'));
		}
	}

});
