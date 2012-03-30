Ext.define('NextThought.store.MyStuff', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.Hit',
	proxy: {
		type: 'search',
		reader: 'nti'
	},
	groupField: 'Type',
	autoLoad: false,
	remoteFilter: true,
	remoteGroup: false,
	remoteSort: false,


	load: function(){
		this.proxy.url = $AppConfig.service.getUserDataSearchURL();
		return this.callParent(arguments);
	},


	onProxyLoad: function() {
		var result = this.callParent(arguments);
		
		this.remoteFilter = false;
		this.filters.clear();
		this.filter([{
			filterFn: (function(){
				var seen = {};
				return function(item) {
					if(item.get('Type')==='MessageInfo'){
						var cid = item.get('ContainerId');
						if(seen.hasOwnProperty(cid)){
							return false;
						}
						seen[cid] = 1;
					}
					return true;
				};
			}())
		}],null);
		this.remoteFilter = true;
		return result;
	},


	getGroups: function() {
		var r = this.callParent(arguments),
			i = r.length-1;
		for(;i>=0;i--){
			if(r[i].name==='MessageInfo'){
				r[i].name = 'Chat';
			}
		}
		return r;
	},


	getRange: function(){
		if (!this.loaded && !this.initialLoad) {
			this.load();
			this.initialLoad = true;
		}
		return this.callParent(arguments);
	}

});
