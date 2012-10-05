Ext.define('NextThought.store.PageItem',{
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.proxy.reader.Json'
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
			totalProperty: 'TotalItemCount'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		},
		model: 'NextThought.model.GenericObject'
	},

	sorters: [
		{
			property : 'Last Modified',
			direction: 'DESC'
		}
	],


	GETTERS : {
		'Highlight': function(r){return r;},
		'Note': function(r){return r;},
		'TranscriptSummary': function(r){return r.get('RoomInfo');},
		'QuizResult': function(r){return r;}
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
			k,b = null;

		for(k in groups){
			if(groups.hasOwnProperty(k)) {
				b = groups[k].name;
				bins[b] = Ext.Array.sort(groups[k].children,Globals.SortModelsBy(k,this.GETTERS[b]));
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
		var tree = {};
		if(bins){
			Ext.Object.each(bins,function(k,o){
				if(o && o[0].isThreadable){
					this.buildItemTree(o, tree); } }, this);

			this.prune(tree);
		}

		return tree;
	},



	buildItemTree: function(list, tree){
		var me = this;

		Ext.each(list, function buildTree(r){
			var g = me.GETTERS[r.getModelName()](r),
					oid = g.getId(),
					parent = g.get('inReplyTo'),
					p;


			r.children = r.children || [];

			if(!tree.hasOwnProperty(oid)) {
				tree[oid] = r;
			}

			if(parent){
				p = tree[parent];
				if(!p) {
					p = (tree[parent] = getID(parent));
				}
				if(!p){
					p = (tree[parent] = AnnotationUtils.replyToPlaceHolder(g));
					buildTree(p);
				}

				p.children = p.children || [];
				if(Ext.Array.indexOf(p.children, r) < 0){
					p.children.push(r);
				}
				else{
					console.warn('Ignoring duplicate record in child list', r, p.children);
				}

				r.parent = p;
			}
		});

		function getID(id) {
			var r = null,
					f = function(o)
					{
						if( o && o.get && o.getId() === id ) {
							r = o;
							return false;
						}
						return true;
					};
			Ext.each(list,f);
			if( !r ) {
				Ext.each(tree,f);
			}
			return r;
		}
	},


	prune: function(tree){

		function canPrune(o){
			return o!==null && (!o.parent && o.placeHolder);
		}

		function needsPruning(){
			var k;
			for(k in tree){ if(tree.hasOwnProperty(k) && canPrune(tree[k])) { return true; } }
			return false;
		}

		function prune(k,o){
			if(!canPrune(o)) { return; }
			delete tree[k];
			Ext.each(o.children, function(c){
				delete c.parent;
				c.pruned = true;
			});
		}

		while(needsPruning()){
			Ext.Object.each(tree, prune);
		}

		//take all children off the main collection... make them accessible only by following the children pointers.
		Ext.Object.each(tree,function(k,o,a){
			if(o.parent){ delete a[k]; }
		});
	},


	add: function(record) {
		//get added to the store:
		this.callParent(arguments);

		//find my parent if it's there and add myself to it:
		var parentId = record.get('inReplyTo'),
			grandparent = null;
		if (parentId) {
			this.each(function(parent){
				if (parentId === parent.getId()) {
					//found our parent:
					record.parent = parent;
					if (!parent.children){parent.children = [];}
					parent.children.push(record);
					//fire events for anyone who cares:
					parent.fireEvent('child-added',record);
					record.fireEvent('parent-set',parent);
				}
			});
		}
	}
});
