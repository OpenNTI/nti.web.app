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
		{ name: 'Prerequisites', type: 'string', persist: false },
		{ name: 'ProviderDepartmentTitle', type: 'string', persist: false },
		{ name: 'ProviderUniqueID', type: 'string', persist: false },
		{ name: 'Schedule', type: 'string', persist: false },
		{ name: 'StartDate', type: 'string', persist: false },
		{ name: 'Title', type: 'string', persist: false },
		{ name: 'Video', type: 'string', persist: false }
	]
});
