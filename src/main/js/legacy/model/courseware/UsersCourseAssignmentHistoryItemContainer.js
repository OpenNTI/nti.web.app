const Ext = require('@nti/extjs');

require('../Base');

module.exports = exports = Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItemContainer', {
	extend: 'NextThought.model.Base',

	mimeType: [
		'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemcontainer'
	],


	fields: [
		{name: 'Items', type: 'arrayItem', persist: false},

		//set by the store when it loads
		{name: 'item', type: 'auto', persist: false},
		{name: 'AssignmentId', type: 'string', persist: false},
	],


	shouldSaveGrade: function (value, letter) {
		const historyItem = this.getMostRecentHistoryItem();

		return historyItem && historyItem.shouldSaveGrade(value, letter);
	},


	saveGrade: function (value, letter) {
		const historyItem = this.getMostRecentHistoryItem();

		return historyItem.saveGrade(value, letter, (response) => {
			const newRaw = {
				...this.raw,
				Links: response.Links,
				NTIID: response.NTIID,
				OID: response.OID,
				LastModified: response.LastModified,
				href: response.href
			};

			this.isPlaceholder = false;
			this.set(newRaw);
		});
	},


	getMostRecentHistoryItem () {
		const items = this.get('Items');

		return items && items[items.length - 1];
	},


	getMostRecentHistoryItemGrade () {
		const mostRecentHistoryItem = this.getMostRecentHistoryItem();

		return mostRecentHistoryItem && mostRecentHistoryItem.get('Grade');
	},


	beginReset: function (isMine) {
		let record = this;
		let msg;

		if (!isMine) {
			msg = 'This will reset this assignment for this student. It is not recoverable.' +
					'\nFeedback and work will be deleted.';
		} else {
			msg = 'This will reset the assignment. All work will be deleted and is not recoverable.';
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
						cls: 'caution'
					},
					secondary: 'Cancel'
				},
				fn: function (button) {
					if (button === 'yes') {
						Service.post(record.getLink('Reset'))
							.then(() => {
								let items = [];

								if (record.collection && record.collection.createPlaceholderHistoryItem) {
									items = [
										record.collection.createPlaceholderHistoryItem(record.get('item'), record.get('Creator'))
									];
								}

								record.set('Items', items);

								// trigger re-sync on containerRecord with new history item record so store updates grid
								record.syncWith(record);
								record.fireEvent('reset-assignment');
								return Promise.resolve();
							}).then(() => {
								fulfill();
							});
					}
				}
			});
		});

	}
});
