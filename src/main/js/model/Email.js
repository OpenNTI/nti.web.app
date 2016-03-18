var Ext = require('extjs');
var ModelBase = require('./Base');
var MixinsModelWithBodyContent = require('../mixins/ModelWithBodyContent');


module.exports = exports = Ext.define('NextThought.model.Email', {
	extend: 'NextThought.model.Base',

	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	mimeType: 'application/vnd.nextthought.email',

	fields: [
		{ name: 'Body', type: 'auto' },
		{ name: 'Subject', type: 'string' },
		{ name: 'Receiver', type: 'auto', persist: false},
		{ name: 'NoReply', type: 'boolean', defaultValue: false},
		{ name: 'url', type: 'string', persist: false},
		{ name: 'scope', type: 'string', persist: false},
		{ name: 'replyScope', type: 'string', persist: false},
		{ name: 'Copy', type: 'boolean'}
	]
});
