Ext.define('NextThought.view.courseware.overview.parts.Section', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-section',

	ui: 'course',
	cls: 'overview-section',

	layout: 'auto',
	componentLayout: 'natural',
	childEls: ['body'],
	getTargetEl: function() {
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


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.title || 'Untitled',
			type: this.type || ''
		});

		if (this.type) {
			this.addCls(this.type);
		}
	},


	onAdd: function(item, index){
		var first = this.items.getCount() === 1;

		this.mon(item,'show','show');

		if(item.isHidden() && first){
			this.hide();
			return;
		}

		if(this.isHidden() && !item.isHidden()){
			this.show();
		}

	}
});
