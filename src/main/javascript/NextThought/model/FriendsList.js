Ext.define('NextThought.model.FriendsList', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'friends', type: 'UserList' },
		{ name: 'realname', type: 'string' },
		{ name: 'CompositeGravatars', type: 'AvatarURL' }
	],

	constructor: function(){
		this.callParent(arguments);

		var c = document.createElement('canvas'),
			ctx = c.getContext('2d'),
			urls = this.get('CompositeGravatars').slice(),
			stack = [],
			grid = Math.ceil(Math.sqrt(urls.length)),
			avatarSize = 128,
			padding = 2,
			imgSize = (avatarSize - ((grid+1)*padding))/grid,
			offset = imgSize + padding;

		c.width = c.height = avatarSize;
		ctx.imageSmoothingEnabled = true;

		function finish(){
			stack.pop();
			if(stack.length!==0){ return; }
			//don't use this.set() that would mark this record as dirty
			this.data.avatarURL = c.toDataURL("image/png");
		}

		urls.forEach(function(url,idx){
			var i = new Image(),
				col = idx%grid * offset,
				row = Math.floor(idx/grid) * offset;

			i.onload = function(){
				ctx.drawImage(i,0,0,i.width,i.height, col,row,imgSize,imgSize);
				finish();
			};
			stack.push(url);
			i.src = url;
		});
	},

	destroy: function() {
		this.set('friends', []);
		this.callParent(arguments);
	}

});
