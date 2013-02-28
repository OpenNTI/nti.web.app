Ext.define('NextThought.mixins.GroupLike',{
//must be mixed into a model

	EVERYONE_USERNAME: 'everyone',
	SYSTEM_CREATOR: 'system',
	OLD_SYSTEM_CREATOR: 'zope.security.management.system_user',

	isGroup: true,


	//As of 2/28/2013 no new objects should be coming back
	//with these system creators.  The creator must be a valid
	//entity.  Old objects that used to have these system creators
	//should now be coming back with no creator and the provider portion
	//of the ntiid would be 'Unknown'
	isSystem: function(){
		var c = this.get('Creator').toLowerCase();
		console.trace('This is for legacy data that we shouldnt need to take into consideration again. None of it should be in prod');
		return this.SYSTEM_CREATOR === c || this.OLD_SYSTEM_CREATOR === c;
	},


	//A method that can be used to detect if this is the old system created 'Everyone' group.
	//This shouldn't exist except for very old accounts (non of which would be prod accounts).
	isEveryone: function(){
		console.trace('This is for legacy data that we shouldnt need to take into consideration again. None of it should be in prod');
		return (!this.get('Creator') || this.isSystem()) && this.EVERYONE_USERNAME === this.get('Username').toLowerCase();
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
