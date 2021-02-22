const Ext = require('@nti/extjs');

const lazy = require('legacy/util/lazy-require').get('PresenceInfo', () =>
	require('../PresenceInfo')
);

module.exports = exports = Ext.define(
	'NextThought.model.converters.PresenceInfo',
	{
		override: 'Ext.data.Types',

		PRESENCEINFO: {
			type: 'PresenceInfo',
			sortType: 'none',
			convert: function (v, record) {
				if (!v.isPresenceInfo) {
					return lazy.PresenceInfo.createPresenceInfo(
						record.get('username'),
						'unavailable'
					);
				}

				return v;
			},
		},
	},
	function () {
		function set(o) {
			o.sortType = Ext.data.SortTypes[o.sortType];
		}
		set(this.PRESENCEINFO);
	}
);
