Ext.define('NextThought.store.courseware.ToCBasedOutline', {
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.model.courseware.navigation.Node'
	],
	model: 'NextThought.model.courseware.navigation.Node'
});
