var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.conflict.types.DestructiveChallenge', {
	getType: function () {
		return NextThought.model.conflict.DestructiveChallenge.mimeType;
	},


	__confirmAction: function (conflict) {
		var me = this;

		return new Promise(function (fulfill, reject) {
			return Ext.Msg.show({
				title: 'Are you sure?',
				msg: conflict.getMessage(),
				buttons: {
					primary: {
						text: 'Yes',
						handler: fulfill
					},
					secondary: {
						text: 'No',
						handler: reject
					}
				}, 
				closeHandler:reject		// click on the x close button.
			});
		});
	},


	__continueAction: function (conflict, data) {
		var link = conflict.getLink('confirm'),
			resolve;

		if (!link) {
			return Promise.reject('Unable to resolve conflict');
		}

		if (conflict.isPut()) {
			resolve = Service.put(link, data);
		} else if (conflict.isPost()) {
			resolve = Service.post(link, data);
		} else {
			resolve = Promise.reject('No method');
		}

		return resolve;
	},


	__stopAction: function (conflict, data) {
		return Promise.resolve(null);
	},


	resolve: function (conflict, data) {
		var me = this;

		return this.__confirmAction(conflict)
			.then(this.__continueAction.bind(this, conflict, data), this.__stopAction.bind(this, conflict, data));
	}
});
