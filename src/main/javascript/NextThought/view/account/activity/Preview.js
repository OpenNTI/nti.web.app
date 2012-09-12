Ext.define('NextThought.view.account.activity.Preview',{
	extend: 'Ext.Component',
	alias: 'widget.activity-preview',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'path'},
		{cls: 'location-label'},
		{cls: 'context', cn:[
			{tag: 'canvas'},
			{cls: 'text'}
		]},
		{cls: 'footer', cn: [
		]}

	])
});
