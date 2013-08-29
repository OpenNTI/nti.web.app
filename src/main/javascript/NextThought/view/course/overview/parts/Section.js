Ext.define('NextThought.view.course.overview.parts.Section', {
	extend: 'Ext.container.Container',
	alias:  'widget.course-overview-section',

	ui:  'course',
	cls: 'overview-section',

	layout:          'auto',
	componentLayout: 'natural',
	childEls:        ['body'],
	getTargetEl:     function () {
		return this.body;
	},

	renderTpl: Ext.DomHelper.markup([
										{
											tag: 'h2', cls: '{type}', cn: [
											{tag: 'span', html: '{title}'}
										]
										},
										{
											id: '{id}-body',
											cn: ['{%this.renderContainer(out,values)%}']
										}
									]),


	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.title || 'Untitled',
			type:  this.type || ''
		});

		if (this.type) {
			this.addCls(this.type);
		}
	}
});
