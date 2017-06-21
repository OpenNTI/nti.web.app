const Ext = require('extjs');

require('legacy/mixins/ModelWithBodyContent');
require('./Base');


module.exports = exports = Ext.define('NextThought.model.forums.Post', {
	extend: 'NextThought.model.forums.Base',
	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	isPost: true,

	fields: [
		{ name: 'body', type: 'auto' },
		{ name: 'title', type: 'string' }
	],

	getActivityItemConfig: function () {
		return Promise.resolve({
			message: Ext.String.format('&ldquo;{0}&ldquo;', Ext.String.ellipsis(this.getBodyText(), 50, true)),
			verb: 'commented'
		});
	}
});
