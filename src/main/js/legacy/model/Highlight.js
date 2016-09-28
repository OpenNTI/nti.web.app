var Ext = require('extjs');
require('legacy/model/Base');
require('legacy/model/anchorables/DomContentRangeDescription');


module.exports = exports = Ext.define('NextThought.model.Highlight', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'sharedWith', type: 'UserList'},
		{ name: 'prohibitReSharing', type: 'boolean' },
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'tags', type: 'Auto'},
		{ name: 'selectedText', type: 'string'},
		{ name: 'style', type: 'string'},
		{ name: 'fillColor', type: 'string', defaultValue: 'blue'},
		{ name: 'presentationProperties', type: 'auto', defaultValue: {highlightColorName: 'blue'}},
		{ name: 'applicableRange', type: 'ContentRangeDescription'},

		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
		{ name: 'NotificationGroupingField', mapping: 'CreatedTime', type: 'groupByTime', persist: false, affectedBy: 'CreatedTime'}
	],

	useIdAsFragment: true,

	getActivityItemConfig: function (type, cid) {
		var t = this.getModelName().toLowerCase();

		console.error('%s: does this branch (highlight and redaction) get called??', t);

		if (cid) {
			//TODO: figure out what needs to happen here
		}

		return Promise.resolve(null);
	}
});
