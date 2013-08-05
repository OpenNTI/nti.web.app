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
			direction: 'DESC'
		}
	],
	filters:[
		{filterFn:function(r){
			return !r.parent;}, id:'nochildren'}
	],


	remove: function(record,isMove,silent){
		var r = record || [],
			args = Array.prototype.slice.call(arguments);

		if(!Ext.isArray(r)){
			r = [r];
		}

		if(isMove){
			Ext.each(r,function(r,i,a){
				if(r.placeholder){ a.splice(i,1); }
			}, this, true);
		}

		if(r.length>0){
			args.shift();
			args.unshift(r);
			this.callParent(args);	
		}
	},


	bind: function(otherStore){
		var me = this;

		if(!otherStore){
			return;
		}

		if(Ext.Array.contains(otherStore.$boundToFlat || [], this)){ return; }

		
		function remove(s,rec){
			var f;
			if(rec){
				f = me.filters.getRange();
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
			var placeholders = Ext.Array.filter(s.getItems(),function(r){return r.placeholder && !r.parent;}),
				records = ((rec && (Ext.isArray(rec)?rec:[rec])) || []).concat(placeholders);

			Ext.each(records,function(r){
				var i = me.findExact('NTIID', r.get('NTIID'));
				if(!r || !(r instanceof NextThought.model.Note)){ return; }

				if(i !== -1 && r !== me.getAt(i)){
					console.warn('DUPLICATE NTIID', r, me.getAt(i));
					return;
				}

				if(!r.parent){
					me.add(r);//add one at a time to get insertion sort.
				}
			});
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

		if(Ext.isArray(otherStore.$boundToFlat)){
			otherStore.$boundToFlat.push(this);
		}
		else{
			otherStore.$boundToFlat = [this];
		}

		add(otherStore,otherStore.getRange());
	}
	
});
