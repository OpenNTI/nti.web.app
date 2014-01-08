Ext.define('NextThought.model.courseware.CourseCatalogEntry', {
	alternateClassName: 'NextThought.model.courseware.CourseCatalogLegacyEntry',
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courseware.coursecataloglegacyentry',

	idProperty: 'ProviderUniqueID',
	fields: [
		{ name: 'Communities', type: 'auto', persist: false },
		{ name: 'ContentPackageNTIID', type: 'string', persist: false },
		{ name: 'Credit', type: 'arrayItem', persist: false },
		{ name: 'Description', type: 'string', persist: false },
		{ name: 'Duration', type: 'string', persist: false },
		{ name: 'Instructors', type: 'arrayItem', persist: false },
		{ name: 'Prerequisites', type: 'auto', persist: false },
		{ name: 'ProviderDepartmentTitle', type: 'string', persist: false },
		{ name: 'ProviderUniqueID', type: 'string', persist: false },
		{ name: 'Schedule', type: 'auto', persist: false },
		{ name: 'StartDate', type: 'date', dateFormat: 'Y-m-d', persist: false },
		{ name: 'Title', type: 'string', persist: false },
		{ name: 'Video', type: 'string', persist: false },

		{ name: 'Preview', type: 'Synthetic', fn: function() {
			return this.get('StartDate') > new Date();
		} },

		{ name: 'icon', type: 'string', mapping: 'LegacyPurchasableIcon' }, //small
		{ name: 'thumbnail', type: 'string', mapping: 'LegacyPurchasableThumbnail' }, //small/medium
		{ name: 'poster', type: 'string' }, //medium (promo)
		{ name: 'background', type: 'string' } //large
	],

	isExpired: function() {
		var d, s;
		try {
			d = new Date().getTime() - (new Duration(this.get('Duration')).inSeconds() * 1000);
			s = this.get('StartDate').getTime();
			return d > s;
		} catch (e) {}

		return false;
	}
});

