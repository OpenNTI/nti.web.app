const Duration = require('durationjs');

const Ext = require('@nti/extjs');
const { scoped } = require('@nti/lib-locale');
const lazy = require('internal/legacy/util/lazy-require')
	.get('UserDataActions', () =>
		require('internal/legacy/app/userdata/Actions')
	)
	.get('ParseUtils', () => require('internal/legacy/util/Parsing'));
const BatchExecution = require('internal/legacy/util/BatchExecution');

const Grade = require('./Grade');

require('../assessment/UsersCourseAssignmentAttemptMetadataItem');
require('../Base');

const t = scoped(
	'nti-web-app.model.courseware.UsersCourseAssignmentHistoryItem',
	{
		resetWarning: {
			self: 'This will reset the assignment. All work will be deleted and is not recoverable.',
			other: 'This will reset this assignment for this student. It is not recoverable. \nFeedback and work will be deleted.',
		},
	}
);

module.exports = exports = Ext.define(
	'NextThought.model.courseware.UsersCourseAssignmentHistoryItem',
	{
		alternateClassName:
			'NextThought.model.courseware.UsersCourseAssignmentHistoryItemSummary',
		extend: 'NextThought.model.Base',

		SYNC_BLACKLIST: ['item'],

		statics: {
			getBatchExecution: function () {
				this.batchExecution =
					this.batchExecution || BatchExecution.create();

				return this.batchExecution;
			},
		},

		mimeType: [
			'application/vnd.nextthought.assessment.userscourseassignmenthistoryitem',
			'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemsummary',
		],

		fields: [
			{ name: 'Feedback', type: 'singleItem', persist: false },
			{ name: 'Grade', type: 'singleItem', persist: false },
			{ name: 'Submission', type: 'singleItem', persist: false },
			{
				name: 'SubmissionCreatedTime',
				type: 'date',
				dateFormat: 'timestamp',
				persist: false,
			},
			{ name: 'pendingAssessment', type: 'singleItem', persist: false },
			{ name: 'Metadata', type: 'auto', persit: false },
			{ name: 'SyntheticSubmission', type: 'boolean', persist: false },
			{ name: 'MetadataAttemptItem', type: 'singleItem' },

			//set by the store when it loads
			{ name: 'AssignmentId', type: 'string', persit: false },

			//set by the store when it loads
			{ name: 'item', type: 'auto', persist: false },

			//<editor-fold desc="Synthetic fields derived from server data and the assocated assignment.">
			{
				name: 'ntiid',
				type: 'Synthetic',
				persist: false,
				fn: function () {
					var i = this.get('item');
					return i && i.get('ntiid');
				},
			},

			{
				name: 'ContainerId',
				type: 'Synthetic',
				persist: false,
				fn: function () {
					var i = this.get('item');
					return i && i.get('containerId');
				},
			},

			{
				name: 'name',
				type: 'Synthetic',
				persist: false,
				fn: function () {
					var i = this.get('item');
					return (i && i.get('title')) || 'Missing';
				},
			},

			{
				name: 'due',
				type: 'Synthetic',
				persist: false,
				fn: function () {
					var i = this.get('item');
					return i && i.getDueDate();
				},
			},

			{
				name: 'feedback',
				type: 'Synthetic',
				persist: false,
				fn: function (r) {
					var f = r.get('Feedback');
					f = (f && f.get('Items')) || [];
					return f.length || r.raw.FeedbackCount;
				},
				convert: function () {
					this.sortType = Ext.data.SortTypes.asInt;
					return this.type.convert.apply(this, arguments);
				},
			},

			{
				name: 'correct',
				type: 'int',
				persist: false,
				affectedBy: 'pendingAssessment',
				convert: function (v, r) {
					var a = r.get('pendingAssessment');
					return (a && a.getCorrectCount()) || 0;
				},
			},

			{
				name: 'completed',
				type: 'date',
				dateFormat: 'timestamp',
				persist: false,
				mapping: 'SubmissionCreatedTime',
				affectedBy: 'Submission',
				convert: function (v, r) {
					if (!v) {
						var s = r.get('Submission');
						return (
							s && this.type.convert.call(this, s.raw.CreatedTime)
						);
					}
					return this.type.convert.call(this, v);
				},
			},

			{
				name: 'submission',
				type: 'string',
				persist: false,
				affectedBy: ['SubmissionCreatedTime', 'Submission'],
				convert: function (v, r) {
					return r.get('SubmissionCreatedTime') ||
						r.get('Submission') ||
						v
						? 'true'
						: '';
				},
			},

			{
				name: 'grade',
				type: 'Synthetic',
				persist: false,
				fn: function (r) {
					var s = r.get('Grade'),
						values = s && s.getValues();

					return (values && values.value) || '';
				},
			},
			//</editor-fold>
		],

		constructor: function () {
			this.callParent(arguments);
			if (
				this.raw &&
				this.raw.Class === 'UsersCourseAssignmentHistoryItemSummary'
			) {
				this.isSummary = true;
			}
		},

		getDataForSync(data) {
			const newGrade = data.Grade;
			const oldGrade = this.get('Grade');

			if (newGrade) {
				oldGrade.syncWith(newGrade);
				oldGrade.phantom = newGrade.phantom;

				data.Grade = oldGrade;
			}

			return data;
		},

		onSync: function (record) {
			var cls = this.get('Class');

			this.isPlaceholder = record.isPlaceholder;

			if (cls === 'UsersCourseAssignmentHistoryItemSummary') {
				this.isSummary = true;
			} else {
				this.isSummary = false;
			}
		},

		__whileGradeSaving() {
			return new Promise(fulfill => {
				const onChanged = () => {
					Ext.destroy(this.gradeChangeMonitor);
					fulfill();
				};

				if (this.gradeIsSaving) {
					this.gradeChangeMonitor = this.on({
						destroyable: true,
						'grade-saved': onChanged,
					});
				} else {
					fulfill();
				}
			});
		},

		resolveFullContainer() {
			return this.isPlaceholder || !this.hasLink('HistoryItemContainer')
				? this.__resolveFullContainerPlaceholder()
				: this.__resolveFullContainerActual();
		},

		__resolveFullContainerPlaceholder() {
			return this.collection.createPlaceholderHistoryItemContainerWithItem(
				this.get('item'),
				this.get('Creator'),
				this
			);
		},

		async __resolveFullContainerActual() {
			try {
				const containerLink = this.getLink('HistoryItemContainer');
				const historyItem = await this.resolveFullItem();

				let grade = historyItem.get('Grade');

				if (grade && this.collection && this.collection.GradeCache) {
					grade = this.collection.GradeCache.getRecord(grade);
				}

				const containerRaw = await Service.request(containerLink);
				const container = lazy.ParseUtils.parseItems([containerRaw])[0];

				container.set({
					item: this.get('item'),
					Items: (container.get('Items') || []).map(item => {
						if (item.getId() === historyItem.getId()) {
							historyItem.set('Grade', grade);

							return historyItem;
						}

						item.set('Grade', grade);
						return item;
					}),
				});

				container.collection = this.collection;

				return container;
			} catch (e) {
				return null;
			}
		},

		resolveFullItem() {
			const link = this.getLink('UsersCourseAssignmentHistoryItem');

			return this.__whileGradeSaving()
				.then(() => {
					if (link && this.isSummary) {
						return Service.request(link).then(resp =>
							this.syncWithResponse(resp)
						);
					}

					return this.updateFromServer();
				})
				.then(() => this);
		},

		getAssignmentId: function () {
			var r = this.raw,
				g = r.Grade,
				s = r.Submission,
				p = r.pendingAssessment,
				i = this.get('item');

			return (
				(i && i.getId()) ||
				(g && g.AssignmentId) ||
				(s && s.assignmentId) ||
				(p && p.assignmentId)
			);
		},

		isSubmitted: function () {
			return this.get('pendingAssessment') || this.get('Submission');
		},

		isSyntheticSubmission() {
			return this.get('SyntheticSubmission');
		},

		getDuration: function () {
			const attempt = this.get('MetadataAttemptItem');

			return attempt && attempt.getDuration();
		},

		allowReset: function () {
			return !!this.getLink('edit');
		},

		/**
		 * Deletes the assignment history item if it can, returns a promise that either
		 * 1.)	Fufill with false if they cancel the dialog
		 * 2.)	Rejects if the request was unsuccessful
		 * 3.)	Fulfills with true if the request was successful
		 *
		 * @param  {boolean} isMine Which message to show in the confirmation
		 * @returns {Promise}		 fulfills is it was successful
		 */
		resetAssignment: function (isMine) {
			let record = this;
			let msg,
				url = record.getLink('edit');
			//let store = this.store;

			if (!isMine) {
				msg = t('resetWarning.other');
			} else {
				msg = t('resetWarning.self');
			}

			return new Promise(function (fulfill, reject) {
				Ext.MessageBox.alert({
					title: 'Are you sure?',
					msg: msg,
					icon: 'warning-red',
					buttonText: true,
					buttons: {
						primary: {
							name: 'yes',
							text: 'Yes',
							cls: 'caution',
						},
						secondary: 'Cancel',
					},
					fn: function (button) {
						if (button === 'yes') {
							if (!url) {
								reject('No edit link');
							} else {
								Service.request({
									url: url,
									method: 'DELETE',
								})
									.catch(function () {
										console.error(
											'Failed to reset assignment: ',
											arguments
										);
										reject('Request Failed');
									})
									.then(function () {
										var user = record.get('Creator'),
											item = record.get('item'),
											grade = null;

										delete record.isSummary;
										delete record.raw.SubmissionCreatedTime;
										delete record.raw.Submission;
										delete record.raw.FeedbackCount;
										delete record.raw.Grade;
										delete record.raw.Feedback;
										delete record.raw.Metadata;

										if (
											record.collection &&
											record.collection
												.createPlaceholderGrade
										) {
											grade =
												record.collection.createPlaceholderGrade(
													item,
													user
												);

											record.raw.Grade = grade;
										}

										record.set({
											Submission: null,
											Grade: grade,
											Feedback: null,
											Metadata: null,
											MetadataAttemptItem: null,
											completed: null,
											SubmissionCreatedTime: null,
											submission: null,
											pendingAssessment: null,
										});

										record.isPlaceholder = true;

										fulfill(true);
									});
							}
						} else {
							fulfill(false);
						}
					},
				});
			});
		},

		doReset() {
			if (this.hasLink('Reset')) {
				return Service.post(this.getLink('Reset'));
			}

			return Service.request({
				url:
					this.getLink('UsersCourseAssignmentHistoryItem') ||
					this.get('href'),
			});
		},

		beginReset: function () {
			let record = this;
			// let store = record.store;

			return new Promise((fulfill, reject) => {
				Ext.MessageBox.alert({
					title: 'Are you sure?',
					msg: t('resetWarning.other'),
					icon: 'warning-red',
					buttonText: true,
					buttons: {
						primary: {
							name: 'yes',
							text: 'Yes',
							cls: 'caution',
						},
						secondary: 'Cancel',
					},
					fn: function (button) {
						if (button === 'yes') {
							record
								.doReset()
								.catch(function () {
									alert('Sorry, I could not do that.');
									reject();
									console.error(arguments);
								})
								.then(function () {
									var user = record.get('Creator'),
										item = record.get('item'),
										grade = null;

									delete record.isSummary;
									delete record.raw.SubmissionCreatedTime;
									delete record.raw.Submission;
									delete record.raw.FeedbackCount;
									delete record.raw.Grade;
									delete record.raw.Feedback;
									delete record.raw.Metadata;

									if (
										record.collection &&
										record.collection.createPlaceholderGrade
									) {
										grade =
											record.collection.createPlaceholderGrade(
												item,
												user
											);

										record.raw.Grade = grade;
									}

									record.set({
										Submission: null,
										Grade: grade,
										Feedback: null,
										Metadata: null,
										completed: null,
										SubmissionCreatedTime: null,
										submission: null,
										pendingAssessment: null,
									});

									record.isPlaceholder = true;
									record.fireEvent('reset-assignment');
									record.fireEvent('was-destroyed');
									fulfill();
								});
						}
					},
				});
			});
		},

		makePlaceholder(gradeOverride) {
			const user = this.get('Creator');
			const item = this.get('item');
			let grade = null;

			delete this.isSummary;
			delete this.raw.SubmissionCreatedTime;
			delete this.raw.Submission;
			delete this.raw.FeedbackCount;
			delete this.raw.Grade;
			delete this.raw.Feedback;
			delete this.raw.Metadata;

			if (
				gradeOverride ||
				(this.collection && this.collection.createPlaceholderGrade)
			) {
				grade =
					gradeOverride ||
					this.collection.createPlaceholderGrade(item, user);

				this.raw.Grade = grade;
			}

			this.set({
				Submission: null,
				Grade: grade,
				Feedback: null,
				Metadata: null,
				completed: null,
				SubmissionCreatedTime: null,
				submission: null,
				pendingAssessment: null,
			});

			this.isPlaceholder = true;

			this.fireEvent('was-destroyed');
		},

		handleExcuseGrade: function (menuItemEl) {
			var grade = this.get('Grade'),
				me = this;
			var handle;

			if (grade && grade.excuseGrade) {
				handle = grade
					.excuseGrade()
					.then(function (record) {
						let txt =
							record.get('IsExcused') === true
								? 'Unexcuse Grade'
								: 'Excuse Grade';
						// let store = me.store;
						let newGrade = me.get('Grade');

						if (menuItemEl) {
							menuItemEl.setText(txt);
						}

						if (newGrade) {
							newGrade.set('IsExcused', record.get('IsExcused'));
						}
						me.fireEvent('excused-changed', newGrade);
					})
					.catch(function (err) {
						console.log('Excusing grade failed: ' + err);
					});
			} else {
				handle = Promise.resolve();
			}

			return handle;
		},

		getSubmissionStatus: function (due) {
			due = due || this.get('due');

			var completed = this.get('completed');

			completed =
				(completed &&
					completed.get &&
					completed.get('Last Modified')) ||
				completed;

			if (!due && !completed) {
				console.error(
					'Can not get the submission status without a due or completed date'
				);
				return;
			}

			//if there's no submission
			if (!completed) {
				return {
					cls: 'incomplete',
					html: 'Due ' + Ext.Date.format(due, 'm/d'),
				};
			}

			//if its submitted before it was due
			if (completed < due) {
				return { cls: 'ontime', html: 'On Time' };
			}

			//if no due date we can't tell how late it is...
			if (!due) {
				return {
					cls: 'ontime',
					html: 'Submitted ' + Ext.Date.format(completed, 'm/d'),
				};
			}

			//if we get here it was late
			due = new Duration(Math.abs(completed - due) / 1000);
			due = due.ago().replace('ago', '').trim();

			return { cls: 'late', html: due + ' Late' };
		},

		shouldSaveGrade: function (value, letter) {
			var grade = this.get('Grade');

			return grade.shouldSave(value, letter);
		},

		__createNewGrade(grade, value, letter, callback) {
			const batcher = this.self.getBatchExecution();

			return batcher
				.schedule(() => grade.createNewGrade(value, letter))
				.then(response => Ext.decode(response))
				.then(historyItemContainer => {
					//update the grade with the new values;
					let historyItem =
						historyItemContainer.Items[
							historyItemContainer.Items.length - 1
						];
					grade.set(historyItem.Grade);
					grade.isPlaceholder = false;

					historyItem.Grade = grade;

					//update with the new history item values
					this.raw = Ext.apply(this.raw || {}, historyItem);
					this.set(historyItem);
					this.isPlaceholder = false;

					//if we get here the submission has been forced from setting the grade
					//so fire an event to update the ui appropriately
					this.fireEvent('force-submission');

					if (callback) {
						callback(historyItemContainer);
					}
				});
		},

		__updateGrade(grade, value, letter) {
			const batcher = this.self.getBatchExecution();

			return batcher
				.schedule(() => grade.saveValue(value, letter))
				.then(newGrade => grade.syncWith(newGrade))
				.then(() => {});
		},

		__maybeUpdateFromServer() {
			const batcher = this.self.getBatchExecution();
			const grade = this.get('Grade');

			return (!grade || grade.isPlaceholder) && grade.getId()
				? batcher.schedule(() => this.updateFromServer())
				: Promise.resolve();
		},

		/**
		 * Given a value and letter for a grade, either create one or update an existing one
		 *
		 * @param  {string} value  value of the grade
		 * @param  {Char} letter letter of the grade
		 * @param  {Function} callback Called with response of setGrade
		 * @returns {Promise}	 fulfills when the grade has been saved
		 */
		saveGrade: function (value, letter, callback) {
			const oldGrade = this.get('Grade');
			const cleanUp = () => {
				delete this.gradeIsSaving;
				this.fireEvent('grade-saved');
			};

			this.gradeIsSaving = true;

			return this.__maybeUpdateFromServer()
				.then(updated => {
					const newGrade = updated && updated.get('Grade');

					if (newGrade) {
						oldGrade.syncWith(newGrade);
						oldGrade.phantom = newGrade.phantom;

						//Keep the same cached instance of the grade
						updated.set('Grade', oldGrade);
					}

					return oldGrade;
				})
				.then(grade => {
					let update;

					//if the grade is a placeholder and we aren't trying to save any values
					if (grade.isPlaceholder && Grade.isEmpty(value, letter)) {
						update = Promise.resolve();

						//If we are a placeholder create new grade
					} else if (this.isPlaceholder) {
						update = this.__createNewGrade(
							grade,
							value,
							letter,
							callback
						);

						//If we aren't a placeholder and the grade has different values save the new ones
					} else if (!grade.valueEquals(value, letter)) {
						update = this.__updateGrade(grade, value, letter);

						//otherwise the grade doesn't need to be updated so just resolve
					} else {
						update = Promise.resolve();
					}

					return update;
				})
				.then(result => {
					cleanUp();

					return result;
				})
				.catch(result => {
					cleanUp();

					return Promise.reject(result);
				});
		},
	}
);
