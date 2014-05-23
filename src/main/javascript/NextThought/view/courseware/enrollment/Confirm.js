Ext.define('NextThought.view.courseware.enrollment.Confirm', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-confirm',

	ui: 'purchase-form',

	ordinal: 1,
	confirmLabel: getString('course-enrollment-drop', 'Drop'),

	renderTpl: Ext.DomHelper.markup([
			{tag: 'tpl', 'if': 'enrolled', cn: [
				{ tag: 'h3', cls: 'gap', html: '{{{NextThought.view.courseware.enrollment.Confirm.enroll}}}'}
			]},
			{tag: 'tpl', 'if': '!enrolled', cn: [
				{ tag: 'h3', cls: 'gap', html: '{{{NextThought.view.courseware.enrollment.Confirm.drop}}}'}
			]},
			{ html: '{detail}'},
			{ cls: 'gap', cn: [
				{html: '{{{NextThought.view.courseware.enrollment.Confirm.confirm}}}'}
			]}
		]),


	renderSelectors: {
	},


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {},{
			enrolled: this.enrolled,
			detail: getString(this.enrolled ? 'drop.detail' : 'enroll.detail')
		});
	},


	onConfirm: function() {
		this.fireEvent('show-enrollment-complete', this, this.record);
	}
});
