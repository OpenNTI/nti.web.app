Ext.define('NextThought.store.PageItem',{
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.proxy.reader.Json',
		'NextThought.util.UserDataThreader'
	],
	model: 'NextThought.model.GenericObject',

	autoLoad: false,
	pageSize: 20,

	groupField: 'Class',
	groupDir  : 'ASC',
	proxy: {
		url: 'tbd',
		type: 'rest',
		limitParam: 'batchSize',
		pageParam: undefined,
		startParam: 'batchStart',
		reader: {
			type: 'nti',
			root: 'Items',
			totalProperty: 'FilteredTotalItemCount'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		},
		model: 'NextThought.model.GenericObject'
	},


	statics: {
		make: function makeFactory(url,id,disablePaging){
			var ps = this.create({
				clearOnPageLoad: false,
				containerId: id
			});
			ps.proxy.url = url;
			if(disablePaging){
				ps.proxy.limitParam = undefined;
				ps.proxy.startParam = undefined;
				delete ps.pageSize;
			}
			return ps;
		}
	},

	constructor: function(){
		var r = this.callParent(arguments);

		this.on('write', this.onWrite);

		return r;
	},


	onWrite: function(store, info) {
		if (info.action === 'destroy') {
			Ext.each(info.records, function(record){
				store.remove(record);
			});
		}
	},


	getBins: function(){
		var groups = this.getGroups(),
			bins = {},
			k,b = null,
			getters = NextThought.util.UserDataThreader.GETTERS;

		for(k in groups){
			if(groups.hasOwnProperty(k)) {
				b = groups[k].name;
				bins[b] = Ext.Array.sort(groups[k].children,Globals.SortModelsBy(k,getters[b]));
			}
		}

		return b ? bins : null;
	},


	getItems: function(otherBins){
		var bins = otherBins||this.getBins()|| {},
			tree = this.buildThreads(bins);

		return Ext.Object.getValues(tree).concat(bins.Highlight||[]).concat(bins.Redaction||[]);
	},

	buildThreads: function(bins){
		var tree = {},
            bms = bins.Bookmark;

        //handle bookmarks here:
        if(bms){
            if (bms.length !== 1) {
                console.error('Oops, more than 1 bookmark on this page??', bms);
            }
            NextThought.model.events.Bus.fireEvent('bookmark-loaded',bms[0]);
            delete bins.Bookmark;
        }

		return NextThought.util.UserDataThreader.buildThreads(bins);
	},


	add: function(record) {
		//get added to the store:
		this.callParent(arguments);

		function adoptChild(parent, child){
			//found our parent:
			child.parent = parent;
			if (!parent.children){parent.children = [];}
			parent.children.push(child);
			//fire events for anyone who cares:
			parent.fireEvent('child-added', child);
			child.fireEvent('parent-set', parent);
		}

		function checkStoreItem(ancestor){
			return function checkItem(storeItem){
				if (ancestor === storeItem.getId()) {
					adopted = true;
					adoptChild(storeItem, record);
					return false; //Break if adopted
				}
				else if(!Ext.isEmpty(storeItem.children)){
					Ext.each(storeItem.children, checkItem);
				}
				return true;
			};
		}

		//find my parent if it's there and add myself to it:
		var ancestor = null, adopted,
			refs = (record.get('references') || []).slice();

		if(Ext.isEmpty(refs)){
			return;
		}

		while(!adopted && !Ext.isEmpty(refs) ){
			this.each(checkStoreItem(refs.pop()));
		}

		if(!adopted){
			console.warn('Unable to parent child', record);
		}
	},


	remove: function(records){
		var toActuallyRemove = [];

		if(Ext.isEmpty(records)){
			console.warn('Remove called with no records', records);
			return;
		}

		if (!Ext.isArray(records)) {
            records = [records];
        }

		Ext.each(records, function(record){
			if(record.placeholder || !record.wouldBePlaceholderOnDelete()){
				Ext.Array.push(toActuallyRemove, record);
			}
			else{
				record.convertToPlaceholder();
			}
		}, this);

		if(!Ext.isEmpty(toActuallyRemove)){
			this.callParent([toActuallyRemove]);
		}

		Ext.each(toActuallyRemove, function(record){
			record.tearDownLinks();
		});
	}
});
