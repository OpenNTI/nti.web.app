Ext.define('NextThought.app.course.overview.components.editing.overviewgroup.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-overviewgroup-preview',

	renderTpl: Ext.DomHelper.markup([
		{
			tag: 'h2', cls: 'content-driven', cn: [
				{tag: 'span', html: '{title}', style: '{[(values.color && ("background-color: #" + values.color)) || "" ]}'}
			]
		}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.group.get('title'),
			color: this.group.get('accentColor')
		});
	}
});
