var Ext = require('extjs');
var ModelBase = require('./Base');
var MixinsModelWithBodyContent = require('../mixins/ModelWithBodyContent');


module.exports = exports = Ext.define('NextThought.model.MessageInfo', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.messageinfo',

	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	addMimeTypeToRoute: true,

	fields: [
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'Status', type: 'string' },
		{ name: 'body', type: 'auto', defaultValue: [''] },
		{ name: 'channel', type: 'string' },
		{ name: 'recipients', type: 'auto' },
		{ name: 'sharedWith', type: 'auto'}
	],

  	hasBeenModerated: function () {
		return Boolean(!this.getLink('flag') && !this.getLink('flag.metoo'));
	},

	hasBeenFlagged: function () {
		return Boolean(this.getLink('flag.metoo'));
	}
});
