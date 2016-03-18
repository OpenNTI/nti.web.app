var Ext = require('extjs');
var ParseUtils = require('../util/Parsing');
var ModelBase = require('./Base');
var MixinsGroupLike = require('../mixins/GroupLike');
var MixinsAvatar = require('../mixins/Avatar');


/**
 * See UserRepository#getUser() on how these are resolved.
 *
 * DO NOT let these be queried for by the user search/ UserRepository resolver methods. (Bad things will happen)
 */
module.exports = exports = Ext.define('NextThought.model.Community', {
	extend: 'NextThought.model.Base',

	mixins: {
		groupLike: 'NextThought.mixins.GroupLike',
		Avatar: 'NextThought.mixins.Avatar'
	},

	isCommunity: true,
	isProfile: true,

	idProperty: 'Username',
	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'backgroundURL', type: 'string'},
		{ name: 'about', type: 'string'},
		{ name: 'displayName', convert: function(v, r) {return r.getName();}},

		//UI fields
		{ name: 'avatarInitials', type: 'string', persist: false},
		{ name: 'avatarBGColor', type: 'string', persist: false}
	],


	constructor: function() {
		this.callParent(arguments);

		this.initAvatar();
	},


	getName: function() {
		return this.get('alias') || this.get('realname');
	},

	toString: function() {
		return this.getName();
	},

	getProfileUrl: function() {
		var id = this.get('Username');
		if (id && this.getLink('Activity')) {
			return '/community/' + ParseUtils.encodeForURI(id);
		}

		return null;
	},

	hasActivity: function() {
		return !!this.getLink('Activity');
	},


	isDefaultForum: function(forum) {
		return forum && forum.get('title') === 'Forum';
	},


	getDefaultForum: function() {
		return this.getForumList()
			.then(function(forums) {
				forums = forums.filter(function(forum) {
					return forum.get('title') === 'Forum';
				});

				return forums[0];
			});
	},


	getForums: function() {
		return this.getForumList()
			.then(function(forums) {
				return forums.filter(function(forum) {
					return forum.get('title') !== 'Forum';
				});
			});
	},


	getForumList: function(force) {
		if (this.loadForumList && !force) {
			return this.loadForumList;
		}

		var link = this.getLink('DiscussionBoard');

		if (!link) {
			return Promise.resolve([]);
		}

		this.loadForumList = Service.request(link)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			})
			.then(function(board) {
				var content = board && board.getLink('contents');

				return content ? Service.request(content) : Promise.reject('No contents link');
			})
			.then(function(response) {
				var json = JSON.parse(response);

				return ParseUtils.parseItems(json.Items);
			})
			.fail(function(reason) {
				console.error('Failed to load forum list for community:', reason);

				return [];
			});

		return this.loadForumList;
	}
});
