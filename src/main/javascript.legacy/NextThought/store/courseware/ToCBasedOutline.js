Ext.define('NextThought.store.courseware.ToCBasedOutline', {
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.model.courses.navigation.Node'
	],
	model: 'NextThought.model.courses.navigation.Node'
});
