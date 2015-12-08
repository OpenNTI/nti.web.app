Ext.define('NextThought.app.course.overview.components.editing.content.ParentSelection', {
	extend: 'NextThought.app.course.overview.components.editing.parentselection.Index',
	alias: 'widget.overview-editing-content-parentselection',


	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'item {cls}',
		'data-ntiid': '{ntiid}',
		cn: [
			{cls: 'label', html: '{label}'},
			{cls: 'color', style: {background: '#{color}'}}
		]
	})),


	parseItemData: function(item) {
		return {
			cls: '',
			ntiid: item.getId(),
			label: item.get('title'),
			color: item.get('accentColor')
		};
	}
});
