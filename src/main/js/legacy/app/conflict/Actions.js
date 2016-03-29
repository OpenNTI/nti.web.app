var Ext = require('extjs');
var CommonActions = require('../../common/Actions');
var TypesDestructiveChallenge = require('./types/DestructiveChallenge');


module.exports = exports = Ext.define('NextThought.app.conflict.Actions', {
	extend: 'NextThought.common.Actions',

	getTypes: function () {
		if (!this.types) {
			this.types = [
				new NextThought.app.conflict.types.DestructiveChallenge()
			];
		}

		return this.types;
	},

	resolveConflict: function (conflict, data) {
		var types = this.getTypes(),
			handler;


		handler = types.reduce(function (acc, type) {
			if (type && type.getType && type.getType() === conflict.mimeType) {
				acc = type;
			}

			return acc;
		}, null);

		return handler ? handler.resolve(conflict, data) : this.defaultHandler(conflict, data);
	},

	defaultHandler: function (conflict, data) {
		//TODO: fill this out
	}
});
