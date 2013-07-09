Ext.define('NextThought.store.FlatPage',{
	extend: 'Ext.data.Store',
	model: 'NextThought.model.Base',
	proxy: 'memory',

	buffered: false,
	clearOnPageLoad: true, 
	clearRemovedOnLoad: true,
	sortOnLoad: true,
	statefulFilters: false,
	remoteSort: false,
	remoteFilter: false,
	remoteGroup: false,
	filterOnLoad: true,
	sortOnFilter: true,

	sorters:[
		{
		//	property : 'line',
		//	direction: 'ASC'
		//},{
			property : 'CreatedTime',
			direction: 'ASC'
		}
	],
	filters:[
		{filterFn:function(r){
			return !r.parent;}, id:'nochildren'}
	],


	remove: function(record,isMove,silent){
		var args = Array.prototype.slice.call(arguments);

		if(!Ext.isArray(record)){
			record = [record];
		}

		if(isMove){
			Ext.each(record,function(r,i,a){
				if(r.placeholder){ a.splice(i,1); }
			}, this, true);
		}

		if(record.length>0){
			args.shift();
			args.unshift(record);
			this.callParent(args);	
		}
	},


	bind: function(otherStore){
		var me = this;
		if(otherStore.$boundToFlat){ return; }

		
		function remove(s,rec){
			var f;
			if(rec){
				f = me.filters.getRange();
				console.debug('filters',f);
				me.clearFilter(true);
				me.remove(rec, true);
				me.filter(f);
			}


		}

		function cleanUp(o) {
			o.clearFilter(true);
			remove(o,o.getRange());
		}


		function add(s,rec){
			rec = s.getItems();
			var filter = [];
			Ext.each(rec||filter,function(r){
				if(!r.parent && r instanceof NextThought.model.Note && me.findExact('NTIID', r.get('NTIID')) < 0){
					filter.push(r);
				}
			});

			if(filter){
				me.add(filter);
			}
		}

		otherStore.on('cleanup','destroy',
				me.mon(otherStore,{
					scope: me,
					destroyable: true,
					add: add,
					load: add,
					bulkremove: remove,
					remove: remove,
					cleanup: cleanUp
				}));

		otherStore.$boundToFlat = true;

		add(otherStore,otherStore.getItems());
	}
	
});