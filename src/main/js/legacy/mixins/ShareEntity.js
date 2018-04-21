const Ext = require('@nti/extjs');

const ShareEntity =
module.exports = exports = Ext.define('NextThought.mixins.ShareEntity', {

	isDynamicSharing: function () {
		return ShareEntity.isDynamicSharing(this.data);
	},

	getPresentationType: function () {
		return ShareEntity.getPresentationType(this.data);
	},

	statics: {
		isDynamicSharing: function (data) {
			return Boolean(data.IsDynamicSharing);
		},

		getPresentationType: function (data) {
			return this.isDynamicSharing(data) ? 'group' : 'list';
		}
	}
});
