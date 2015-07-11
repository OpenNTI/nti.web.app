Ext.define('NextThought.model.FriendsList', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.util.Object'
	],

	mixins: {
		groupLike: 'NextThought.mixins.GroupLike',
		shareEntity: 'NextThought.mixins.ShareEntity'
	},
	
	statics: {
		BLANK_AVATAR: '/app/resources/images/icons/unresolved-group.png'
	},

	isFriendsList: true,

	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'friends', type: 'UserList' },
		{ name: 'realname', type: 'string' },
		{ name: 'CompositeGravatars', type: 'AvatarURL' },
		{ name: 'displayName', convert: function(v,r) {return r.getName();}},
		{ name: 'IsDynamicSharing', type: 'auto'},
		{ name: 'about', type: 'string'}
	],

	constructor: function() {
		this.callParent(arguments);
		ObjectUtils.defineAttributes(this, {
			isDFL: {
				getter: this.mixins.shareEntity.isDynamicSharing,
				setter: function() { throw 'readonly'; }
			},

			readableType: {
				getter: this.mixins.shareEntity.getPresentationType,
				setter: function() { throw 'readonly'; }
			}
		});

	},
		   
	getAboutData: function() {
	   return {
		   displayName: this.getName(),
		   about: this.get('about')
	   };
	},
	
	getProfileUrl: function() {
		var id = this.get('Username');
		
		if(id && this.getLink('Activity')){
			return '/group/'+ParseUtils.encodeForURI(id);
		}
		
		return null;
	},


	destroy: function() {
		this.set('friends', []);
		this.callParent(arguments);
	},


	drawIcon: function(canvas) {
		var ctx = canvas.getContext('2d'),
			urls = this.get('CompositeGravatars').slice(),
			grid = Math.ceil(Math.sqrt(urls.length)),
			avatarSize = canvas.width,
			padding = grid > 1 ? 2 : 0,
			imgSize = (avatarSize - ((grid - 1) * padding)) / grid,
			offset = imgSize + padding;

		ctx.imageSmoothingEnabled = true;

		Ext.each(urls, function(url,idx) {
			var i = new Image(),
				col = idx % grid * offset,
				row = Math.floor(idx / grid) * offset;
			i.onload = function() {
				ctx.drawImage(i,
						0,	0,	i.width, i.height,	//source x,y,w,h
						col, row, imgSize, imgSize		//dest   x,y,w,h
				);
			};
			i.src = url;
		});
	}

});
