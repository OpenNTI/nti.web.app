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


	__saveRecord: function(form, record) {
		if (!form.submitToRecord) {
			return Promise.reject({
				msg: 'Unable to update record.',
				err: 'Invalid form element'
			});
		}

		return form.submitToRecord(record)
			.fail(function(reason) {
				return Promise.reject({
					msg: 'Unable to update record.',
					err: reason
				});
			});
	},


	__moveRecord: function(record, originalParent, newParent, root) {
		if (!newParent.appendFromContainer) {
			return Promise.reject({
				msg: 'Unable to move record.',
				err: 'Invalid target parent'
			});
		}

		return newParent.appendFromContainer(record, originalParent, root)
			.fail(function(reason) {
				return Promise.reject({
					msg: 'Unable to move record.',
					err: reason
				});
			});
	},


	__updateRecord: function(form, record, originalParent, newParent, root) {
		return this.__saveRecord(form, record)
			.then(this.__moveRecord.bind(this, record, originalParent, newParent, root));
	},


	saveEditorForm: function(form, record, originalParent, newParent, root) {
		if (record) {
			return this.__updateRecord(form, record, originalParent, newParent, root);
		}

		return this.__createRecord(form, newParent);
	}
});
