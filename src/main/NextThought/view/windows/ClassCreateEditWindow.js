Ext.define('NextThought.view.windows.ClassCreateEditWindow', {
	extend: 'Ext.window.Window',
	alias : 'widget.class-create-edit-window',

	requires: [
		'NextThought.view.form.ClassInfoForm'
	],

	width: 700,
	height: 350,
	modal: true,
	maximizable:true,
	constrain: true,
	autoScroll: true,
	title: 'Class Editor',
	cls: 'class-create-edit-window',
/*
	items:
	{
		xtype: 'class-info-form'
	},
*/
	dockedItems: {
		dock: 'bottom',
		xtype: 'toolbar',
		items: [
			'->',
			{text: 'Save', action:'save'},
			{text: 'Cancel', action:'cancel'}
		]
	},

	/**
	 * Just pass along the value to the form
	 *
	 * @param v - a classinfo
	 */
	setValue: function(v) {

		var m = v.isModifiable();

		this.add({xtype: 'class-info-form', value: v});

		if (!m) {
			this.down('button[action=save]').disable();
		}
	}

});
