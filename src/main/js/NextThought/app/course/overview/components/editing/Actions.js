Ext.define('NextThought.app.course.overview.components.editing.Actions', {
	extend: 'NextThought.common.Actions',

	statics: {
		MAX_TITLE_LENGTH: 300
	},

	__createRecord: function(form, position) {
		var parent = position && position.parent;

		if (!parent.insertForm) {
			return Promise.reject({
				msg: 'Unable to create record.',
				err: 'Invalid position'
			});
		}

		return parent.insertForm(form, position.index)
			.fail(this.parseError.bind(this));
	},


	__createRecordValues: function(values, position) {
		var parent = position && position.parent;

		if (!parent.insertContent) {
			return Promise.reject({
				msg: 'Unable to create record.',
				err: 'Invalid parent'
			});
		}

		return parent.insertContent(values, position.index)
			.fail(this.parseError.bind(this));
	},


	__saveRecord: function(form, record) {
		//if we aren't passed a form, there is nothing to update
		if (!form) { return Promise.resolve(); }

		if (!form.submitToRecord) {
			return Promise.reject({
				msg: 'Unable to update record.',
				err: 'Invalid form element'
			});
		}

		return form.submitToRecord(record);
	},


	__saveRecordValues: function(values, record) {
		var link = record.getLink('edit');

		if (!link) {
			return Promise.reject({
				msg: 'Unable to update record',
				err: 'No edit link'
			});
		}

		return Service.put(link, values)
			.then(function(response) {
				record.set(values);
				record.syncWithResponse(response);

				return record;
			});
	},


	__moveRecord: function(record, originalPosition, newPosition, root) {
		if (!newPosition && !originalPosition) {
			return Promise.resolve();
		}

		var newParent = newPosition.parent,
			originalParent = originalPosition.parent;

		if (!newParent || !newParent.moveToFromContainer) {
			return Promise.reject({
				msg: 'Unable to move record.',
				err: 'Invalid target parent'
			});
		}

		if (newPosition.index === originalPosition.index && newParent.isSameContainer && newParent.isSameContainer(originalParent)) {
			return Promise.resolve(record);
		}

		return newParent.moveToFromContainer(record, newPosition.index, originalPosition.index, originalParent, root)
			.fail(function(reason) {
				return Promise.reject({
					msg: 'Unable to move record.',
					error: reason
				});
			});
	},


	__updateRecord: function(form, record, originalPosition, newPosition, root) {
		return this.__saveRecord(form, record)
			.then(this.__moveRecord.bind(this, record, originalPosition, newPosition, root))
			.fail(this.parseError.bind(this));
	},


	__updateRecordVisibility: function(record, visibilityCmp){
		var link = record.getLink('edit'),
			values = visibilityCmp && visibilityCmp.getChangedValues && visibilityCmp.getChangedValues();

		if (!link) {
			return Promise.reject('No Edit Link');
		}

		if (!values || Object.keys(values) === 0) {
			return Promise.resolve();
		}

		return Service.put(link, values)
				.then(function(response) {
					return ParseUtils.parseItems(response)[0];
				});
	},


	__updateRecordValues: function(values, record, originalPosition, newPosition, root) {
		return this.__saveRecordValues(values, record)
			.then(this.__moveRecord.bind(this, record, originalPosition, newPosition, root))
			.fail(this.parseError.bind(this));
	},


	__getPosition: function(position, record) {
		if (!position.isModel) { return position; }

		return {
			parent: position,
			index: position.getItemsCount()
		};
	},


	/**
	 * Handle the logic for creating a new record, updating an existing one
	 * and maybe moving it to new parent.
	 *
	 * This originalPosition and newPosition both look like:
	 *
	 * {
	 * 	parent: Model, //something that mixins the OrderedContents
	 * 	index: Number, //the position in that parent
	 * }
	 *
	 * If the originalPosition and newPosition are records, treat it as an append
	 *
	 * @param  {NextThought.common.form.Form} form           the form component with the inputs
	 * @param  {Object} record         the record we are editing, null if creating
	 * @param  {Object} originalPosition the parent and index the record started at
	 * @param  {Object} newPosition      the parent and index the record is moving to
	 * @param  {Object} root           the root of both parents
	 * @return {Promise}               fulfill when successful, reject when fail
	 */
	saveEditorForm: function(form, record, originalPosition, newPosition, root, visibilityCmp) {
		var me = this;
		originalPosition = this.__getPosition(originalPosition);
		newPosition = this.__getPosition(newPosition);

		if (record) {
			return this.__updateRecord(form, record, originalPosition, newPosition, root)
					.then(function(record) {
						if (visibilityCmp) {
							return me.__updateRecordVisibility(record, visibilityCmp);
						}

						return record;
					});

		}

		return this.__createRecord(form, newPosition)
				.then(function(record) {
					if (visibilityCmp) {
						return me.__updateRecordVisibility(record, visibilityCmp);
					}

					return record;
				});
	},


	saveValues: function(values, record, originalParent, newParent, root) {
		if (record) {
			return this.__updateRecordValues(values, record, originalParent, newParent, root);
		}

		return this.__createRecordValues(values, newParent);
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

		return Service.post(link, {'publishBeginning': date})
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			})
			.then(function(rec) {
				record.syncWith(rec);
				return record;
			});
	},


	publish: function(record) {
		var link = record && record.getLink('publish');
		if (!link) {
			return Promise.reject('No link');
		}

		return Service.post(link)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			})
			.then(function(rec) {
				record.syncWith(rec);
				return record;
			});
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
			})
			.then(function(rec) {
				record.syncWith(rec);
				return record;
			});
	},


	parseError: function(reason) {
		var response = reason && reason.responseText,
			item;

		try {
			item = response && JSON.parse(response);
		} catch (err) {
			console.error('Error' + reason.err);
		}

		return Promise.reject(item || {msg: 'Unable to update record.'});
	}

});
