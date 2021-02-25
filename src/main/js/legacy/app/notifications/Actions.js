const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');
const lazy = require('legacy/util/lazy-require').get('ParseUtils', () =>
	require('legacy/util/Parsing')
);

const UserDataStateStore = require('../userdata/StateStore');

const NotificationsStateStore = require('./StateStore');

require('legacy/common/Actions');
require('legacy/model/Change');

module.exports = exports = Ext.define('NextThought.app.notifications.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.NotificationsStore = NotificationsStateStore.getInstance();
		this.UserDataStore = UserDataStateStore.getInstance();

		this.mon(
			this.UserDataStore,
			'incomingChange',
			this.incomingChange,
			this
		);
	},

	async load() {
		try {
			var store = this.NotificationsStore;

			const pageInfo = await Service.getPageInfo(Globals.CONTENT_ROOT);

			var url = pageInfo.getLink(Globals.MESSAGE_INBOX),
				lastViewed = new Date(0);

			if (!url) {
				console.error('No Notifications url');
				url = 'bad-notifications-url';
			}

			try {
				lastViewed = new Date(
					parseFloat(
						//we get this back in seconds so convert it to millis
						await Service.request(url + '/lastViewed')
					) * 1000
				);
			} catch (e) {
				console.warn('Could not resolve notifications lastViewed');
			} finally {
				store.buildStore(url, lastViewed);
				this.loaded = true;
			}
		} catch {
			console.error('Could not setup notifications!');
		}
	},

	incomingChange: function (change) {
		var me = this;

		this.NotificationsStore.getStore().then(function (store) {
			if (!store) {
				return;
			}
			if (!change.isModel) {
				change = lazy.ParseUtils.parseItems([change])[0];
			}

			if (change.isNotable()) {
				if (/^DELETE/i.test(change.get('ChangeType'))) {
					me.NotificationsStore.removeRecord(change);
					return;
				}

				if (
					change.get('ChangeType') !== 'Modified' ||
					change.get('IsNewlyMentioned')
				) {
					me.NotificationsStore.addRecord(change);
				}
			}
		});
	},
});
