const Ext = require('@nti/extjs');
const { isFeature } = require('internal/legacy/util/Globals');
const User = require('internal/legacy/model/User');
const Badge = require('internal/legacy/model/openbadges/Badge');
const DynamicFriendsList = require('internal/legacy/model/DynamicFriendsList');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ContextStateStore',
	() => require('internal/legacy/app/context/StateStore')
);

module.exports = exports = Ext.define(
	'NextThought.app.navigation.path.parts.Profiles',
	{
		constructor: function () {
			this.callParent(arguments);

			this.ContextStore = lazy.ContextStateStore.getInstance();
		},

		addHandlers: function (handlers) {
			handlers[User.mimeType] = this.getPathToUser.bind(this);
			handlers[Badge.mimeType] = {
				doNotCache: true,
				fn: this.getPathToBadge.bind(this),
			};
			handlers[DynamicFriendsList.mimeType] =
				this.getPathToDynamicFriendsList.bind(this);

			return handlers;
		},

		getPathToUser: function (user) {
			return Promise.resolve([user]);
		},

		getPathToBadge: function (badge, getPathTo) {
			var user = badge.targetUser || $AppConfig.userObject;

			return getPathTo(user).then(function (path) {
				if (isFeature('badges')) {
					path.push('achievements', badge);
				}

				return path;
			});
		},

		getPathToDynamicFriendsList: function (dfl) {
			return Promise.resolve([dfl]);
		},
	}
);
