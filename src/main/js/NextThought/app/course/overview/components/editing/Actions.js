Ext.define('NextThought.app.course.overview.components.editing.Actions', {
	extend: 'NextThought.common.Actions',

	__createRecord: function(form, parent) {
		if (!parent.appendForm) {
			return Promise.reject({
				msg: 'Unable to create record.',
				err: 'Invalid parent'
			});
		}

		return parent.appendForm(form);
	},


	__updateRecord: function(form, record, originalParent, newParent, root) {

	},


	saveEditorForm: function(form, record, originalParent, newParent, root) {
		if (record) {
			return this.__updateRecord(form, record, originalParent, newParent, root);
		}

		return this.__createRecord(form, newParent);
	}
});
