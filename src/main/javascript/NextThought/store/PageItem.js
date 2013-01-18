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

		if(bins){
			Ext.Object.each(bins,function(k,o){
				if(o && o[0].isThreadable){
					this.buildItemTree(o, tree); } }, this);

			//take all children off the main collection... make them accessible only by following the children pointers.
			Ext.Object.each(tree,function(k,o,a){
				if(o.parent){ delete a[k]; }
			});

			this.prune(tree);
		}

		return tree;
	},



	buildItemTree: function(list, tree){
		var me = this;
console.group("Build Tree");
		Ext.each(list, function clearRefs(r){
            delete r.children;
            delete r.parent;
        });

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
					console.log('Generating placeholder for id:',parent, '  child:',oid);
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

		console.groupEnd("Build Tree");
	},


	prune: function(tree){
		//until we decide we want to prune from the root down... this is a non-desired function. (we cannot have leaf
		// placeholders with the current threading algorithm.)
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
