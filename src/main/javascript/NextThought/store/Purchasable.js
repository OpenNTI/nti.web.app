Ext.define('NextThought.store.Purchasable',{
	extend: 'NextThought.store.NTI',

	requires: [
	],

	autoLoad: false,

	model: 'NextThought.model.GenericObject',

	sorters: [
		function(a,b){
			var re = /NTI/;
			a = re.test(a.get('Provider')|| a.get('Title'));
			b = re.test(b.get('Provider')|| b.get('Title'));
			return a===b? 0 : a ? 1 : -1;//move NTI items to the end
		},
		{
			property: 'Featured',
			direction: 'DESC'
//		},{
//			property: 'courseName',
//			direction: 'DESC'
		},{
			property: 'Title',
			direction: 'DESC'
		}
	],

	proxy: {
		url: 'tbd',
		type: 'rest',
		noCache: true,
		reader: {
			type: 'nti',
			root: 'Items'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		},
		model: 'NextThought.model.GenericObject'
	}

});

