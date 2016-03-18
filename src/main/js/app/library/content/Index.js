var Ext = require('extjs');
var MixinsRouter = require('../../../mixins/Router');


module.exports = exports = Ext.define('NextThought.app.library.content.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-content',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	items: [{xtype: 'box', autoEl: {html: 'Content'}}]
});
