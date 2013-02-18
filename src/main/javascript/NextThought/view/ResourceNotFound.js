Ext.define('NextThought.view.ResourceNotFound',{
	extend: 'Ext.Component',
	alias: 'widget.notfound',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'resource-not-found', cn:[
			{ cls: 'body', cn: [
				{ cls: 'heading', html: 'Sorry, this page doesn\'t exist...'},
				{ cls: 'subtext', html: 'Your link may contain errors or the page may no longer exist.'},
				{ cls: 'actions', cn: [
					{cls: 'library', tag: 'a', html: 'Library'},
					{cls: 'back', tag: 'a', html: 'Previous Page'}
				]}
			]}
		]}
	])
});

