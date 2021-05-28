const Ext = require('@nti/extjs');
const { scoped } = require('@nti/lib-locale');

require('../Base');

const t = scoped(
	'nti-web-app.model.courseware.UsersCourseAssignmentHistoryItemContainer',
	{
		resetWarning: {
			self: 'This will reset the assignment. All work will be deleted and is not recoverable.',
			other: 'This will reset this assignment for this student. It is not recoverable. \nFeedback and work will be deleted.',
		},
	}
);

module.exports = exports = Ext.define(
	'NextThought.model.courseware.UsersCourseAssignmentHistoryItemContainer',
	{
		extend: 'NextThought.model.Base',

		mimeType: [
			'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemcontainer',
		],

		fields: [
			{ name: 'Items', type: 'arrayItem', persist: false },

			//set by the store when it loads
			{ name: 'item', type: 'auto', persist: false },
			{ name: 'AssignmentId', type: 'string', persist: false },
		],

		shouldSaveGrade: function (value, letter) {
			const historyItem = this.getMostRecentHistoryItem();

			return historyItem?.shouldSaveGrade(value, letter);
		},

		doNotAllowInterfaceInstance() {
			return this.isPlaceholder;
		},

		saveGrade: async function (value, letter) {
			const historyItem = this.getMostRecentHistoryItem();

			return historyItem
				?.saveGrade(value, letter, async response => {
					const oldItems = this.get('Items');
					const oldItem = this.get('item');
					const oldId = this.get('AssignmentId');

					this.isPlaceholder = false;

					try {
						await this.syncWithResponse(response);
					} finally {
						this.set({
							Items: oldItems,
							item: oldItem,
							AssignmentId: oldId,
						});
					}
				})
				.then(() => {
					const grade = historyItem.get('Grade');
					const items = this.get('Items');

					for (let item of items) {
						item.set('Grade', grade);
					}
				});
		},

		getMostRecentHistoryItem() {
			const items = this.get('Items');

			return items?.[items.length - 1];
		},

		getMostRecentHistoryItemGrade() {
			const mostRecentHistoryItem = this.getMostRecentHistoryItem();

			return mostRecentHistoryItem?.get('Grade');
		},

		beginReset: function (isMine) {
			let record = this;
			let msg;

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
							Service.post(record.getLink('Reset'))
								.then(() => {
									const historyItem =
										record.getMostRecentHistoryItem();

									if (historyItem) {
										historyItem.makePlaceholder(
											record.collection?.createPlaceholderGrade(
												record.get('item'),
												record.get('Creator')
											)
										);
										record.set('Items', [historyItem]);
									} else if (
										record.collection
											?.createPlaceholderHistoryItem
									) {
										record.set('Items', [
											record.collection.createPlaceholderHistoryItem(
												record.get('item'),
												record.get('Creator')
											),
										]);
									}

									// trigger re-sync on containerRecord with new history item record so store updates grid
									record.isPlaceholder = true;
									record.clearInterfaceInstance();
									record.syncWith(record, false);
									record.fireEvent('reset-assignment');
									return Promise.resolve();
								})
								.then(() => {
									fulfill();
								});
						}
					},
				});
			});
		},
	}
);
