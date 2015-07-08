Ext.define('NextThought.app.navigation.path.parts.Profiles', {

	addHandlers: function(handlers) {
		handlers[NextThought.model.User.mimeType] = this.getPathToUser.bind(this);

		return handlers;
	},


	getPathToUser: function(user) {
		return Promise.resolve([user]);
	}

});
