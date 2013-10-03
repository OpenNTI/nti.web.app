Ext.define('NextThought.view.annotations.View', {
	extend: 'Ext.view.View',
	alias: 'widget.annotation-view',

	store: 'FlatPage',
	ui: 'annotation-view',
	cls: 'annotation-view scrollable',

	overItemCls: 'over',
	itemSelector: '.row',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{ cls: 'row', cn: [
			{cls: 'name', html: '{Creator}'},
			{cls: 'snippet', html: '{preview}'},
			{cls: 'footer', cn: [
				{tag: 'span', html: '{ReplyCount:plural("Comment")}'},
				{tag: 'span', html: '{CreatedTime:timeDifference}'}
			]}
		] }

	]})),


	handleEvent: function(e) {
		if (e.getTarget('a[href]')) {
			e.preventDefault();
		}
		return this.callParent(arguments);
	}
});
