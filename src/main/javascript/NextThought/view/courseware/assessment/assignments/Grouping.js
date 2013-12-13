Ext.define('NextThought.view.courseware.assessment.assignments.Grouping', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-assignment-group',
	ui: 'course-assessment',
	cls: 'assignment-group',

	requires: [
		'NextThought.layout.component.Natural'
	],

	layout: 'auto',
	componentLayout: 'natural',
	childEls: ['body'],
	getTargetEl: function() { return this.body; },

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'subtitle', html: '{subtitle}' },
		{ cls: 'title', html: '{title}' },
		{ id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	config: {
		subTitle: '',
		title: ''
	},


	updateSubTitle: function(value) { this.updateEl('.subtitle', value); },
	updateTitle: function(value) { this.updateEl('.title', value); },


	updateEl: function(selector, value) {
		if (this.rendered) {
			this.el.select(selector).update(value);
		}
	},


	initComponent: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			subtitle: this.getSubTitle(),
			title: this.getTitle()
		});
	}
});
