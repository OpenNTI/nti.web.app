export default Ext.define('NextThought.app.course.overview.components.parts.Section', {
	extend: 'Ext.container.Container',
	alias: [
		'widget.course-overview-section',
		'widget.course-overview-nticourseoverviewgroup'
	],

	statics: {
		isSection: true
	},

	ui: 'course',
	cls: 'overview-section',

	hidden: true,
	layout: 'auto',
	componentLayout: 'natural',
	childEls: ['body'],
	getTargetEl: function() {
		return this.body;
	},

	renderTpl: Ext.DomHelper.markup([
		{
			tag: 'h2', cls: '{type}', cn: [
			{tag: 'span', html: '{title}', style: '{[(values.color && ("background-color: #" + values.color)) || "" ]}'}
		]
		},
		{
			id: '{id}-body',
			cn: ['{%this.renderContainer(out,values)%}']
		}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		var title = this.title || getString('NextThought.view.courseware.overview.parts.Section.untitled');

		this.renderData = Ext.apply(this.renderData || {}, {
			title: title,
			type: this.type || '',
			color: this.color || false
		});

		if (this.type) {
			this.addCls(this.type);
		}
	},


	onAdd: function(item, index) {
		var first = this.items.getCount() === 1;

		this.mon(item, 'show', 'show');

		if (item.containerCls) {
			this.addCls(item.containerCls);
		}

		if (item.isHidden() && first) {
			this.hide();
			return;
		}

		if (this.isHidden() && !item.isHidden()) {
			this.show();
		}

	},


	setProgress: function(progress) {
		this.items.each(function(item) {
			if (item.setProgress) {
				item.setProgress(progress);
			}
		});
	}
});
