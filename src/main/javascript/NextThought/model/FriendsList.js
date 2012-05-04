Ext.define('NextThought.model.FriendsList', {
	extend: 'NextThought.model.Base',
	resolveUsers: true,

	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'friends', type: 'UserList' },
		{ name: 'realname', type: 'string' },
		{ name: 'CompositeGravatars', type: 'AvatarURL' }
	],

	destroy: function() {
		this.set('friends', []);
		this.callParent(arguments);
	},


	getName: function(){
		return this.get('realname') || this.get('alias');
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
