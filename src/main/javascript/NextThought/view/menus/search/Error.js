Ext.define('NextThought.view.menus.search.Error',{
	extend: 'Ext.Component',
	alias: 'widget.search-error',
	cls: 'search-noresults search-result error',
	renderTpl: [
		'<div class="noresults error">An error occurred processing your request.</div>'
	]
});
