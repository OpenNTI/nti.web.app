Ext.define('NextThought.view.annotations.View',{
	extend: 'Ext.view.View',
	alias: 'widget.annotation-view',

	store: 'FlatPageStore',
	ui: 'annotation-view',
	cls: 'annotation-view',

	overItemCls:'over',
	itemSelector:'.row',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [
		{ cls: 'row', cn:[
			{cls: 'name', html: '{Creator}'},
			{cls: 'snipet', html: '{preview}'},
			{cls: 'footer', cn:[
				{tag:'span', html: '{ReplyCount:plural("Comment")}'},
				{tag:'span', html: '{CreatedTime:timeDifference}'}
			]}
		] }

	]}))
});
