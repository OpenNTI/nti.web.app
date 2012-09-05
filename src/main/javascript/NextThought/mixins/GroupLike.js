Ext.define('NextThought.mixins.GroupLike',{
//must be mixed into a model

	EVERYONE_USERNAME: 'everyone',
	SYSTEM_CREATOR: 'zope.security.management.system_user',


	isSystem: function(){
		return this.SYSTEM_CREATOR === this.get('Creator').toLowerCase();
	},


	isEveryone: function(){
		return this.isSystem() && this.EVERYONE_USERNAME === this.get('Username').toLowerCase();
	},


	getName: function(){
		return this.get('realname') || this.get('alias') || this.get('Username');
	}

});
