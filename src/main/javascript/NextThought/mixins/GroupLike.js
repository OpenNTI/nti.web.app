Ext.define('NextThought.mixins.GroupLike',{
//must be mixed into a model

	EVERYONE_USERNAME: 'everyone',
	SYSTEM_CREATOR: 'zope.security.management.system_user',

	isGroup: true,


	isSystem: function(){
		return this.SYSTEM_CREATOR === this.get('Creator').toLowerCase();
	},


	isEveryone: function(){
		return this.isSystem() && this.EVERYONE_USERNAME === this.get('Username').toLowerCase();
	},


	getName: function(){
		return this.get('realname') || this.get('alias') || this.get('Username');
	},


	addFriend: function(username){
		var list = this.get('friends') || [];
		if(!Ext.Array.contains(list,username)){
			list.push(username);
			this.set('friends',list);
		}
		return this;
	},


	removeFriend: function(username){
		var list = this.get('friends') || [];
		this.set('friends',Ext.Array.remove(list,username));
		return this;
	},


	hasFriend: function(username){
		return Ext.Array.contains(this.get('friends'),username);
	}
});
