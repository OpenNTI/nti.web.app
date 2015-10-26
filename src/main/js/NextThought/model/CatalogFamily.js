Ext.define('NextThought.model.CatalogFamily', {
	extend: 'NextThought.model.Base',

	mixins: {
		PresentationResources: 'NextThought.mixins.PresentationResources'
	},

	fields: [
		{name: 'CatalogFamilyID', type: 'string'},
		{name: 'Description', type: 'string'},
		{name: 'Title', type: 'string'},
		{name: 'PlatformPresentationResources', type: 'auto'},
		{name: 'ProviderDepartmentTitle', type: 'string'},
		{name: 'ProviderUniqueID', type: 'string'},
		{name: 'StartDate', type: 'ISODate'},
		{name: 'EndDate', type: 'ISODate'}
	]
});
