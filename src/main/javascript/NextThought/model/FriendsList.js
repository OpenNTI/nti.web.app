Ext.define('NextThought.model.FriendsList', {
	extend: 'NextThought.model.Base',
	resolveUsers: false,

	mixins: { groupLike: 'NextThought.mixins.GroupLike' },

	isGroup: true,

	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'friends', type: 'UserList' },
		{ name: 'realname', type: 'string' },
		{ name: 'CompositeGravatars', type: 'AvatarURL' },
		{ name: 'displayName', convert: function(v,r){return r.getName();}}
	],

	destroy: function() {
		this.set('friends', []);
		this.callParent(arguments);
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
	},


	drawIcon: function(canvas){

		var ctx = canvas.getContext('2d'),
			urls = this.get('CompositeGravatars').slice(),
			grid = Math.ceil(Math.sqrt(urls.length)),
			avatarSize = canvas.width,
			padding = grid>1 ? 2 : 0,
			imgSize = (avatarSize - ((grid-1)*padding))/grid,
			offset = imgSize + padding;

		ctx.imageSmoothingEnabled = true;

		Ext.each(urls,function(url,idx){
			var i = new Image(),
				col = idx%grid * offset,
				row = Math.floor(idx/grid) * offset;
			i.onload = function(){
				ctx.drawImage(i,
						0,	0,	i.width,i.height,	//source x,y,w,h
						col,row,imgSize,imgSize		//dest   x,y,w,h
				);
			};
			i.src = url;
		});
	}

});
