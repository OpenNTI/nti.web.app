var Ext = require('extjs');
var User = require('../../../../model/User');
var ModelUser = require('../../../../model/User');
var OpenbadgesBadge = require('../../../../model/openbadges/Badge');
var ContextStateStore = require('../../../context/StateStore');
var {isFeature} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.navigation.path.parts.Profiles', {
    constructor: function() {
		this.callParent(arguments);

		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},

    addHandlers: function(handlers) {
		handlers[NextThought.model.User.mimeType] = this.getPathToUser.bind(this);
		handlers[NextThought.model.openbadges.Badge.mimeType] = {doNotCache: true, fn: this.getPathToBadge.bind(this)};
		handlers[NextThought.model.DynamicFriendsList.mimeType] = this.getPathToDynamicFriendsList.bind(this);

		return handlers;
	},

    getPathToUser: function(user) {
		return Promise.resolve([user]);
	},

    getPathToBadge: function(badge, getPathTo) {
		var user = badge.targetUser || $AppConfig.userObject;

		return getPathTo(user)
			.then(function(path) {
				if (isFeature('badges')) {
					path.push('achievements', badge);
				}

				return path;
			});
	},

    getPathToDynamicFriendsList: function(dfl) {
		return Promise.resolve([dfl]);
	}
});
