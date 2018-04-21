const Ext = require('@nti/extjs');
require('legacy/model/Base');

module.exports = exports = Ext.define('NextThought.model.TranscriptSummary', {
	extend: 'NextThought.model.Base',
	addMimeTypeToRoute: true,

	fields: [
		{ name: 'RoomInfo', type: 'singleItem'},
		{ name: 'Contributors', type: 'auto' },

		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
		{ name: 'NotificationGroupingField', mapping: 'CreatedTime', type: 'groupByTime', persist: false, affectedBy: 'CreatedTime'}
	],

	//	isThreadable: true,

	getId: function () {
		try {
			return this.get('RoomInfo').getId();
		}
		catch (e) {
			return null;
		}
	}
});
