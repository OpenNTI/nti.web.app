Ext.define('NextThought.util.UserDataThreader',{
	singleton: true,
	requires: [
	],

	GETTERS : {
		'Highlight': function(r){return r;},
		'Note': function(r){return r;},
		'TranscriptSummary': function(r){return r.get('RoomInfo');},
		'QuizResult': function(r){return r;}
	},

	//TODO unify this function with buildThreads
	//into one function taking a list of userdata
	//and returning a new list where the threadable objects
	//have been threaded.
	threadUserData: function(d){
		var data = !Ext.isArray(d) ? [d] : d,
			tree = {};

		Ext.Array.each(data, function(item){
			if(item && item.isThreadable){
				this.buildItemTree(item, tree);
			}
		}, this);

		this.cleanupTree(tree);

		return Ext.Object.getValues(tree);
	},

	buildThreads: function(bins){
		var tree = {};

		if(bins){
			Ext.Object.each(bins,function(k,o){
				if(o && o[0].isThreadable){
					this.buildItemTree(o, tree);
				}
			}, this);

			this.cleanupTree(tree);
		}

		return tree;
	},

	cleanupTree: function(tree){
		//take all children off the main collection... make them accessible only by following the children pointers.
		Ext.Object.each(tree,function(k,o,a){
			if(o.parent){ delete a[k]; }
		});

		this.prune(tree);
	},

	buildItemTree: function(rawList, tree){
		var me = this, list=[];
	//	console.group("Build Tree");
		//console.log('Using list of objects', rawList);

		function contains(items, o){
			return Ext.Array.some(items, function(a){
				return a.getId() === o.getId();
			});
		}

		//Flatten an preexisting relationships of list into the array ignoring
		//duplicates.  A hash could speed this up
		function flattenNode(n, list){
			if(!n.placeholder && !contains(list, n)){
				Ext.Array.push(list, n);
			}
			else{console.log('Skipping n b/c its already in the list', n);}

			if(!Ext.isEmpty(n.children)){
				Ext.each(n.children, function(kid){
					flattenNode(kid, list);
				});
			}
		}

		Ext.Array.each(rawList, function(n){
			flattenNode(n, list);
		});

	//	console.log('Flattened list is ', list);

		Ext.each(list, function clearRefs(r){
			if(!r.placeholder){
				me.tearDownThreadingLinks(r);
			}
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
					//console.log('Generating placeholder for id:',parent, '  child:',oid);
					p = (tree[parent] = AnnotationUtils.replyToPlaceHolder(g));
					buildTree(p);
				}

				p.children = p.children || [];
				if(!contains(p.children, r)){
				//	console.log('Adding', r, 'as child of', p);
					p.children.push(r);
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

	//	console.groupEnd("Build Tree");
	},


	prune: function(tree){
		//until we decide we want to prune from the root down... this is a non-desired function. (we cannot have leaf
		// placeholders with the current threading algorithm.)

	},

	tearDownThreadingLinks: function(o){
		delete o.parent;
		delete o.children;
	}

},function(){});
