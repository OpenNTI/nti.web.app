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


	/**
	 * Handle the logic for creating a new record, updating an existing one
	 * and maybe moving it to new parent.
	 *
	 * Both the originalParent and the newParent need to mixin the OrderedContents
	 * The root needs to mixin the MovingRoot
	 *
	 * @param  {NextThought.common.form.Form} form           the form component with the inputs
	 * @param  {Object} record         the record we are editing, null if creating
	 * @param  {Object} originalParent the parent the record started at
	 * @param  {Object} newParent      the parent the record is moving to
	 * @param  {Object} root           the root of both parents
	 * @return {Promise}               fulfill when successful, reject when fail
	 */
	saveEditorForm: function(form, record, originalParent, newParent, root) {
		if (record) {
			return this.__updateRecord(form, record, originalParent, newParent, root);
		}

		return this.__createRecord(form, newParent);
	},


	/**
	 * Handle publishing a record (i.e. CourseOutlineNode, CourseOutlineContentNode)
	 * When given a date to published on, we make two request. 
	 * The first one we, post to the publish link to make it publish
	 * and then we edit the AvailableBeginning date and then post to the edit link.
	 *
	 * @param  {CourseOutlineNode} record       A record with a publish link.
	 * @param  {TimeStamp} optionalDate Optional date to publish a date on
	 * @return {Promise}  fulfills when successfully published, reject when it failed.
	 */
	publishOnDate: function(record, date) {
		var link = record && record.getLink('publish');

		if (!link) {
			return Promise.reject('No link');
		}

		return Service.post(link)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			})
			.then(function(rec) {
				var editLink;
				if (date) {
					rec.set('AvailableBeginning', date);
					editLink = rec.getLink('edit');

					if (editLink) {
						return Service.post(editLink)
							.then(function(resp) {
								return ParseUtils.parseItems(resp)[0];
							});
					}
				}

				return rec;
			})
	},


	publish: function(record) {
		return this.publishOnDate(record);
	},


	/**
	 * Handle un-publishing a record (i.e. CourseOutlineNode, CourseOutlineContentNode)
	 *
	 * @param  {CourseOutlineNode} record       A record with a publish link.
	 * @return {Promise}  fulfills when successfully published, reject when it failed.
	 */
	unpublish: function(record) {
		var link = record && record.getLink('unpublish');

		if (!link) {
			return Promise.reject('No link');
		}
		
		return Service.post(link)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			});	
	}

});
