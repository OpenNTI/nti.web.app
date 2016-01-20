Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.ReadingEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-reading-editor',


	requires: ['NextThought.model.RelatedWork'],


	afterRender: function() {
		this.callParent(arguments);

		this.formCmp.setPlaceholder('icon', NextThought.model.RelatedWork.getIconForMimeType('unknown'));
	},


	showEditor: function() {
		this.parentSelection = this.addParentSelection(this.record, this.parentRecord, this.rootRecord, this.onFormChange.bind(this));

		this.formCmp = this.addFormCmp();

		if (this.record) {
			this.deleteBtn = this.addDeleteButton();
		}
	},


	getFormSchema: function() {
		var schema = this.callParent(arguments);

		schema.unshift({type: 'hidden', name: 'href'});
		schema.unshift({type: 'hidden', name: 'type'});

		return schema;
	},


	getDefaultValues: function() {
		var values = this.callParent(arguments),
			selectedItem = this.selectedItems && this.selectedItems[0];

		if (selectedItem) {
			values.label = selectedItem.getAttribute('label');
			values.href = selectedItem.getAttribute('ntiid');
			values.type = NextThought.model.RelatedWork.CONTENT_TYPE;
		}

		return values;
	}
});
