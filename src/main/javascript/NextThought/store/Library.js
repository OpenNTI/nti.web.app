Ext.define('NextThought.store.Library',{
	extend: 'Ext.data.Store',
	requires:[
		'NextThought.model.Title'
	],
	model: 'NextThought.model.Title',
	proxy: {
		type: 'ajax',
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json',
			'Content-Type': 'application/json'
		},
		url : 'tbd',
		reader: {
			type: 'json',
			root: 'titles'
		}
	},
	sorters: [
		{
			sorterFn: function(a, b){
				if(/nextthought/i.test(a.get('author'))){
					return 1;
				}
				if(/nextthought/i.test(b.get('author'))){
					return -1;
				}
				return 0;
			}
		},{
			property: 'title',
			direction: 'asc'
		}
	],


	constructor: function(){
		this.callParent(arguments);
		this.on('beforeload','onBeforeLoad');
	},


	onBeforeLoad: function(){
		if(this.proxy instanceof Ext.data.proxy.Server){//don't resolve the url if we're a memory proxy
			try{
				this.proxy.url = getURL($AppConfig.service.getMainLibrary().href);
			}
			catch(e){
				console.error(e.message, e.stack || e.stacktrace || e);
			}
		}
	}
});
