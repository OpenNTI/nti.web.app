Ext.define('NextThought.app.course.overview.components.editing.Editor', {
	extend: 'Ext.container.Container',
	//this is only extended, never should need to be instantiated

	requires: [
		'NextThought.common.form.Form'
	],

	/**
	 * The Schema used to set up the fields
	 * @override
	 * @type {Array}
	 */
	FORM_SCHEMA: [],

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		var values = this.getDefaultValues();

		this.preview = this.addPreview(values);
		this.form = this.add({
			xtype: 'common-form',
			schema: this.FORM_SCHEMA,
			defaultValues: values,
			onChange: this.onFormChange.bind(this)
		});
	},


	addPreview: function() {},


	getDefaultValues: function() {},


	onFormChange: function(values) {
		if (this.preview && this.preview.update) {
			this.preview.update(values);
		}
	}
});
