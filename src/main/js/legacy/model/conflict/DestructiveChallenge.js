const Ext = require('@nti/extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.conflict.DestructiveChallenge', {
	extend: 'NextThought.model.Base',

	statics: {
		mimeType: 'application/vnd.nextthought.destructivechallenge',

		MESSAGE_OVERRIDES: {}
	},

	mimeType: 'application/vnd.nextthought.destructivechallenge',

	fields: [
		{name: 'message', type: 'string'},
		{name: 'code', type: 'string'}
	],


	getMessage: function () {
		var code = this.get('code');

		return this.self.MESSAGE_OVERRIDES[code] || this.get('message');
	},


	getForceLink: function () {
		return this.getLink('confirm');
	},


	isPut: function () {
		return this.getLinkMethod('confirm') === 'PUT';
	},


	isPost: function () {
		return this.getLinkMethod('confirm') === 'POST';
	}
});
