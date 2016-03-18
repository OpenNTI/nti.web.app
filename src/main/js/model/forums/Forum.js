var Ext = require('extjs');
var ForumsBase = require('./Base');


module.exports = exports = Ext.define('NextThought.model.forums.Forum', {
	extend: 'NextThought.model.forums.Base',

	isForum: true,

	HIDE_PREFIXS: ['Open', 'In-Class'],

	fields: [
		{ name: 'DCDescription', type: 'string' },
		{ name: 'DCTitle', type: 'string' },
		{ name: 'description', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'displayTitle', type: 'Synthetic', persist: false, fn: function(r) {
			var title = r.get('title');

			r.HIDE_PREFIXS.every(function(pre) {
				if (title.indexOf(pre) === 0) {
					title = title.replace(pre, '');
					title = title.trim();

					return false;
				}

				return true;
			});

			return title;
		}},
		{ name: 'TopicCount', type: 'int', persist: false },
		{ name: 'NewestDescendant', type: 'singleitem' },
		{ name: 'NewestDescendantCreatedTime', type: 'date', persist: false, dateFormat: 'timestamp', defaultVale: new Date() },
		{ name: 'ACL', type: 'auto'}
	],

	buildContentsStore: function(idSuffix, cfg, extraParams) {
		var ntiid = this.get('NTIID'),
			myConfig = {
				stateKey: 'forum',
				wantsItem: function(record) {
					return record.get('ContainerId') === ntiid;
				}
			};

		return this.callParent([idSuffix, Ext.apply(myConfig, cfg),
			Ext.apply({
				sortOn: 'NewestDescendantCreatedTime',
				sortOrder: 'DESC'
			},extraParams
		)]);
	},


	getTitle: function() {
		return this.get('displayTitle');
	}
});
