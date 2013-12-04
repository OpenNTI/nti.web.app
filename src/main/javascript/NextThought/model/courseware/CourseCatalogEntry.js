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
		{ name: 'StartDate', type: 'date', dateFormat: 'c', persist: false },
		{ name: 'Title', type: 'string', persist: false },
		{ name: 'Video', type: 'string', persist: false },

		{ name: 'Preview', type: 'Synthetic', fn: function() {
			return this.get('StartDate') > new Date();
		} },

		{ name: 'icon', type: 'string', mapping: 'LegacyPurchasableIcon' }, //small
		{ name: 'thumbnail', type: 'string', mapping: 'LegacyPurchasableThumbnail' }, //small/medium
		{ name: 'poster', type: 'string' }, //medium (promo)
		{ name: 'background', type: 'string' } //large
	]
});


/*

	startDate;


			//<editor-fold desc="Date Parse & Time cleanup">
			function times(t) {
				var v = t;
				if(t.split('T').length === 1){
					v = startDate+t;
				}

				return Ext.Date.parse(v,'c');
			}

			if (json) {
				json.StartDate = Ext.Date.parse(json.StartDate,'c');
				startDate = Ext.Date.format(json.StartDate,'Y-m-d\\T');
				(json.schedule||{}).times = Ext.Array.map((json.schedule||{}).times||[],times);
			}
			//</editor-fold>
 */
