Ext.define('NextThought.view.course.enrollment.Confirm', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-confirm',

	ui: 'purchase-form',

	ordinal: 1,
	confirmLabel: 'Drop',

	renderTpl: Ext.DomHelper.markup([
			{ tag: 'h3', cls: 'gap', html: 'You are about to {enroll} this course.'},
			{ html: '{detail}'},
			{ cls: 'gap', cn: [
				'Are you sure?'
			]}
		]),


	renderSelectors: {
	},


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {},{
			enroll: this.record.getLink('unenroll') ? 'drop' : 'enroll in',
			detail: getString(this.record.getLink('unenroll') ? 'drop.detail' : 'enroll.detail')
		});
	},


	onConfirm: function() {
		this.fireEvent('show-enrollment-complete', this, this.record);
	}
});
