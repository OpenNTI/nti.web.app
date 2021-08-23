const Ext = require('@nti/extjs');
const User = require('internal/legacy/model/User');
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
			handlers[DynamicFriendsList.mimeType] =
				this.getPathToDynamicFriendsList.bind(this);

			return handlers;
		},

		getPathToUser: function (user) {
			return Promise.resolve([user]);
		},

		getPathToDynamicFriendsList: function (dfl) {
			return Promise.resolve([dfl]);
		},
	}
);
