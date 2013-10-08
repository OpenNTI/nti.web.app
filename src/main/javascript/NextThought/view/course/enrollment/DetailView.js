Ext.define('NextThought.view.course.enrollment.DetailView', {
	extend: 'NextThought.view.store.purchase.DetailView',
	alias: 'widget.enrollment-detailview',

	ui: 'detailview-panel',

	renderTpl: '{Description}',

	checkboxLabel: null,
	confirmLabel: 'Enroll',
	closeWithoutWarn: true,

	ordinal: 0,

	initComponent: function() {
		this.callParent(arguments);
		this.setupRenderData();
	},


	setupRenderData: function() {
		if (this.record.getLink('unenroll')) {
			this.confirmLabel = getString('course-enrollment-drop', 'Drop');
		} else {
			this.confirmLabel = getString('course-enrollment-enroll', 'Enroll');
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			Description: this.record.get('Description')
		});
	},


	onConfirm: function() {
		this.fireEvent('show-enrollment-confirmation', this, this.record);
	}
});
