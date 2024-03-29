const Ext = require('@nti/extjs');
const { encodeForURI, isNTIID } = require('@nti/lib-ntiids');
const ObjectUtils = require('internal/legacy/util/Object');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

require('./forums/DFLBoard');
require('./forums/DFLForum');

require('internal/legacy/mixins/GroupLike');
require('internal/legacy/mixins/ShareEntity');
require('internal/legacy/mixins/Avatar');
require('./Base');

module.exports = exports = Ext.define('NextThought.model.FriendsList', {
	extend: 'NextThought.model.Base',

	mixins: {
		groupLike: 'NextThought.mixins.GroupLike',
		shareEntity: 'NextThought.mixins.ShareEntity',
		Avatar: 'NextThought.mixins.Avatar',
	},

	statics: {
		BLANK_AVATAR: '/app/resources/images/icons/unresolved-group.png',
	},

	isFriendsList: true,

	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'friends', type: 'UserList' },
		{ name: 'realname', type: 'string' },
		{ name: 'CompositeGravatars', type: 'AvatarURL' },
		{
			name: 'displayName',
			convert: function (v, r) {
				return r.getName();
			},
		},
		{ name: 'IsDynamicSharing', type: 'auto' },
		{ name: 'about', type: 'string' },

		//UI fields
		{ name: 'avatarInitials', type: 'string', persist: false },
		{ name: 'avatarBGColor', type: 'string', persist: false },
	],

	constructor: function () {
		this.callParent(arguments);

		this.initAvatar();

		ObjectUtils.defineAttributes(this, {
			isDFL: {
				getter: this.mixins.shareEntity.isDynamicSharing,
				setter: function () {
					throw new Error('readonly');
				},
			},

			readableType: {
				getter: this.mixins.shareEntity.getPresentationType,
				setter: function () {
					throw new Error('readonly');
				},
			},
		});
	},

	getAboutData: function () {
		return {
			displayName: this.getName(),
			about: this.get('about'),
		};
	},

	getProfileUrl: function () {
		var id = this.get('Username');

		if (id && this.getLink('Activity')) {
			return (
				'/group/' +
				(isNTIID(id) ? encodeForURI(id) : encodeURIComponent(id))
			);
		}

		return null;
	},

	destroy: function () {
		this.set('friends', []);
		this.callParent(arguments);
	},

	drawIcon: function (canvas) {
		var ctx = canvas.getContext('2d'),
			urls = this.get('CompositeGravatars').slice(),
			grid = Math.ceil(Math.sqrt(urls.length)),
			avatarSize = canvas.width,
			padding = grid > 1 ? 2 : 0,
			imgSize = (avatarSize - (grid - 1) * padding) / grid,
			offset = imgSize + padding;

		ctx.imageSmoothingEnabled = true;

		Ext.each(urls, function (url, idx) {
			var i = new Image(),
				col = (idx % grid) * offset,
				row = Math.floor(idx / grid) * offset;
			i.onload = function () {
				ctx.drawImage(
					i,
					0,
					0,
					i.width,
					i.height, //source x,y,w,h
					col,
					row,
					imgSize,
					imgSize //dest	 x,y,w,h
				);
			};
			i.src = url;
		});
	},

	getDefaultForum: function () {
		return this.getForumList().then(function (forums) {
			forums = forums.filter(function (forum) {
				return forum.get('IsDefaultForum');
			});

			return forums[0];
		});
	},

	getForumList: function (force) {
		if (this.loadForumList && !force) {
			return this.loadForumList;
		}

		var link = this.getLink('DiscussionBoard');

		if (!link) {
			return Promise.resolve([]);
		}

		this.loadForumList = Service.request(link)
			.then(function (response) {
				return lazy.ParseUtils.parseItems(response)[0];
			})
			.then(function (board) {
				var content = board && board.getLink('contents');

				return content
					? Service.request(content)
					: Promise.reject('No Contents Link');
			})
			.then(function (response) {
				var json = JSON.parse(response);

				return lazy.ParseUtils.parseItems(json.Items);
			})
			.catch(function (reason) {
				console.error('Faild to load forum list for group, ', reason);

				return [];
			});

		return this.loadForumList;
	},
});
