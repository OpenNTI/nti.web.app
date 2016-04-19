const Ext = require('extjs');
const UserRepository = require('legacy/cache/UserRepository');
require('./Item');


module.exports = exports = Ext.define('NextThought.app.assessment.components.feedback.List', {
	extend: 'Ext.container.Container',
	alias: 'widget.assignment-feedback-list',
	layout: 'none',
	ui: 'feedback-box',

	bindStore: function (store) {
		this.store = store;
		this.mon(this.store, 'load', 'resolveUsers');
	},


	resolveUsers: function (store) {
		var pluck = Ext.Array.pluck,
			records = store.getRange(),
			me = this;

		function fill (users) {
			users.forEach(function (u, i) {
				var r = records[i],
					c = r && r.get('Creator');
				if (c && typeof c === 'string' && u.getId() === c) {
					r.set('Creator', u);
				} else {
					console.warn('Did not resolve', c, 'for:', r, '. Got:', u);
				}
			});

			me.addRecords(store, records);
		}

		UserRepository.getUser(pluck(pluck(records, 'data'), 'Creator'))
				.done(fill);

	},


	addRecords: function (store, records) {
		var cmps = [],
			me = this;

		(records || []).forEach(function (record) {
			cmps.push({
				xtype: 'assignment-feedback-item',
				doDelete: me.deleteRecord.bind(me),
				record: record,
				syncElementHeight: me.syncElementHeight
			});
		});

		this.removeAll(true);
		this.add(cmps);
	},


	deleteRecord: function (record) {
		let store = this.store;

		if (!record) { return; }

		record.destroy({callback: function () {
			store.load();
		}});
	}

});
