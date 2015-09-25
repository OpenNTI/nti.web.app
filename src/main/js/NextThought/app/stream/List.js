export default Ext.define('NextThought.app.stream.List', {
	extend: 'NextThought.app.stream.Base',
	alias: 'widget.stream-list',

	requires: [
		'NextThought.app.stream.components.ListPage'
	],


	cls: 'list-stream',


	getPageConfig: function() {
		return {
			xtype: 'stream-list-page'
		};
	}
});
