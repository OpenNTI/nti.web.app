Ext.define('NextThought.store.Stream',{
	extend: 'Ext.data.Store',
	requires:[
		'NextThought.proxy.reader.Json'
	],

	model: 'NextThought.model.Change',

	autoLoad: false,

	proxy: {
		type: 'rest',
		reader: {
			type: 'json',
			root: 'Items'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		},
		model: 'NextThought.model.Change'
	},
	sorters: [
		{
			property : 'Last Modified',
			direction: 'DESC'
		}
	],

	constructor: function(){
		this.callParent(arguments);

		var me = this,
			fn = function(item){
				var a = item.get('Item'),
					aid = a.getId(),
					ct = item.get('ChangeType'),
					result = true,
					ac = item.get('Last Modified');

				me.data.each(function(change){
					var b = change.get('Item');
					if(aid === b.getId() && change.get('ChangeType') === ct && (ac - change.get('Last Modified') > 0 )){
						//This means that we've already displayed this particular item.
						result = false;
					}
				});
				return result;
			};


		me.isChangeItemNew = fn;

		me.filter({ scope: me, filterFn:fn});
		return me;
	}

});
