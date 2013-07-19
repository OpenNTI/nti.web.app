Ext.define('NextThought.store.course.Navigation',{
	extend: 'Ext.data.Store',
	requires:[
		'NextThought.model.course.navigation.Node'
	],
	model: 'NextThought.model.course.navigation.Node',
	sorters:[
		{
			property: 'position',
			direction: 'asc'
		}
	]
});
