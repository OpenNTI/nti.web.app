Ext.define('NextThought.mixins.GroupLike',{
//must be mixed into a model

	EVERYONE_USERNAME: 'everyone',
	SYSTEM_CREATOR: 'system',
	OLD_SYSTEM_CREATOR: 'zope.security.management.system_user',

	isGroup: true,


	isSystem: function(){
		var c = this.get('Creator').toLowerCase();
		return this.SYSTEM_CREATOR === c || this.OLD_SYSTEM_CREATOR === c;
	},


	isEveryone: function(){
		//We used to also verify it was a system group but its not coming back with a Creator
		//anymore.
		return this.EVERYONE_USERNAME === this.get('Username').toLowerCase();
	},


	getName: function(){
		return  this.get('alias') || this.get('realname') || this.get('Username');
	},


	getFriends: function(){
		return this.get('friends') || [];
	},


	getFriendCount: function(){
		return (this.get('friends') || []).length;
	},


	addFriend: function(username){
		var list = (this.get('friends') || []).slice();
		if(!Ext.Array.contains(list,username)){
			list.push(username);
			this.set('friends',list);
		}
		return this;
	},


	removeFriend: function(username){
		var list = (this.get('friends') || []).slice();
		this.set('friends',Ext.Array.remove(list,username));
		return this;
	},


	hasFriend: function(username){
		return Ext.Array.contains(this.get('friends'),username);
	}
});
