Ext.define('NextThought.app.course.overview.components.editing.Editor', {
	extend: 'Ext.container.Container',
	//this is only extended, never should need to be instantiated

	requires: [
		'NextThought.common.form.Form'
	],

	cls: 'content-editor',

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

		this.formCmp = this.add({
			xtype: 'common-form',
			schema: this.FORM_SCHEMA,
			defaultValues: values,
			onChange: this.onFormChange.bind(this)
		});

		this.footer = this.add({
			xtype: 'box',
			autoEl: {cls: 'content-editor-footer', cn: [
				{cls: 'button close', html: 'Close'},
				{cls: 'button save', html: 'Save'}
			]},
			listeners: {
				click: {
					element: 'el',
					fn: this.onFooterClick.bind(this)
				}
			}
		});
	},


	addPreview: function() {},


	getDefaultValues: function() {},


	onFormChange: function(values) {
		if (this.preview && this.preview.update) {
			this.preview.update(values);
		}
	},


	onFooterClick: function(e) {
		if (e.getTarget('.close')) {
			this.onClose();
		} else if (e.getTarget('.save')) {
			this.onSave();
		}
	},


	onClose: function() {
		if (this.doClose) {
			this.doClose();
		}
	},


	onSave: function() {
		var data = this.formCmp.getValues();

		if (this.record) {
			this.updateRecord(data);
		} else {
			this.createNewRecord(data);
		}

	},


	updateRecord: function(data) {
		var me = this,
			editLink = me.record.getLink('edit');

		//TODO: if there is a file input this needs to be updated
		//with multipart form data, preferably we could do that every
		//time do simplify logic.

		if (!editLink) {
			console.warn('trying to update a record you dont have permission to');
		} else {
			Service.put(editLink, data)
				.then(function(response) {
					var newRecord = ParseUtils.parseItems(response)[0];

					me.record.syncWith(newRecord);
					me.onClose();
				})
				.fail(function(reason) {
					//TODO: figure out how to handle this
				});
		}
	},


	createNewRecord: function(data) {}
});
