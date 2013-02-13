Ext.define('NextThought.view.ResourceNotFound',{
	extend: 'Ext.Component',
	alias: 'widget.notfound',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'resource-not-found', cn:[
			{ cls: 'heading', html: 'The page you requested was not found.'},
			{ cls: 'subtext', html: 'You may have clicked an expired link or mistyped the address. Some web addresses are case sensitive.'}
		]}
	])
});

