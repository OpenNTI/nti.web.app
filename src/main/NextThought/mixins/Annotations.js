Ext.define('NextThought.mixins.Annotations', {
	requires: [
		'NextThought.model.Highlight',
		'NextThought.model.Note',
		'NextThought.util.ParseUtils',
		'NextThought.util.AnnotationUtils',
		'NextThought.util.QuizUtils',
		'NextThought.view.widgets.annotations.SelectionHighlight',
		'NextThought.view.widgets.annotations.Highlight',
		'NextThought.view.widgets.annotations.Note',
        'NextThought.cache.IdCache'
	],

	GETTERS : {
		'Highlight': function(r){return r;},
		'Note': function(r){return r;},
		'TranscriptSummary': function(r){return r.get('RoomInfo');}
	},

	initAnnotations: function(){
		Ext.apply(this,{
			_annotations: {},
			_filter: null,
			_searchAnnotations: null
		});

		if(!this.getDocumentEl) console.error('Class must implement getDocumentEl');

		this.addEvents('share-with','create-note');

		this.on('afterrender',
			function(){
				this.el.on('mouseup', this.onContextMenuHandler, this);
			},
			this);

		this.widgetBuilder = {
			'Highlight' : this.createHighlightWidget,
			'Note': this.createNoteWidget,
			'TranscriptSummary': this.createTranscriptSummaryWidget
		};

		NextThought.controller.Stream.registerChangeListener(this.onNotification, this);
	},


	applyFilter: function(newFilter){
		// console.debug('applyFilter:', newFilter);
		var _a = this._annotations, a;

		this._filter = newFilter;
		for(a in _a) {
			try {
				if(!_a.hasOwnProperty(a) || !_a[a]) continue;
				_a[a].updateFilterState(this._filter);
			}
			catch(e) { console.error('Annotation Filter Error: ', _a, a, newFilter); }
		}
	},


	showRanges: function(ranges) {
		this._searchAnnotations = Ext.create('annotations.SelectionHighlight', ranges, this.items.get(0).el.dom.firstChild, this);
	},


	clearSearchRanges: function() {
		if (!this._searchAnnotations) return;

		this._searchAnnotations.cleanup();
		this._searchAnnotations = null;
	},


	removeAnnotation: function(oid) {
		var v = this._annotations[oid];
		if (v) {
			v.cleanup();
			this._annotations[oid] = undefined;
			delete this._annotations[oid];
		}
	},

	clearAnnotations: function(){
		var v, oid;
		for(oid in this._annotations){
			if(!this._annotations.hasOwnProperty(oid)) continue;

			v = this._annotations[oid];
			if (!v) continue;
			v.cleanup(true);
		}

		this._annotations = {};
		this.clearSearchRanges();
	},


	annotationExists: function(record){
		var oid = record.get('OID');
		if(!oid){
			return false;
		}

		return !!this._annotations[oid];
	},


	addHighlight: function(range, xy){
		if(!range) {
			return;
		}

		var highlight = AnnotationUtils.selectionToHighlight(range),
			menu,
			w;

		if(!highlight) return;

		w = this.widgetBuilder.Highlight.call(this,highlight,range);

		highlight.set('ContainerId', this._containerId);

		menu = w.getMenu();
		menu.on('hide', function(){
				if(!w.isSaving){
					w.cleanup();
					delete this._annotations[w.tempOID]; //remove the key from the object
				}
			},
			this);
		menu.showAt(xy);

	},


	createHighlightWidget: function(record, r){
		var range = r || AnnotationUtils.buildRangeFromRecord(record),
			oid = record.get('OID'),
			w;

		if (!range) Ext.Error.raise('could not create range');

		if (this.annotationExists(record)) {
			this._annotations[record.get('OID')].getRecord().fireEvent('updated',record);
			return null;
		}


		w = Ext.create(
				'NextThought.view.widgets.annotations.Highlight',
				range, record,
				this.items.get(0).el.dom.firstChild,
				this);
		if( this.bufferedDelayedRelayout )
			this.bufferedDelayedRelayout();

		if (!oid) {
			oid = 'Highlight-' + new Date().getTime();
			w.tempOID = oid;
			record.on('updated',function(r){
				this._annotations[r.get('OID')] = this._annotations[oid];
				this._annotations[oid] = undefined;
				delete this._annotations[oid];
				delete w.tempOID;
			}, this);
		}

		this._annotations[oid] = w;
		return w;
	},


	createNoteWidget: function(record){
		try{
			if(record.get('inReplyTo') || record._parent){
				return false;
			}
			else if (this.annotationExists(record)) {
				this._annotations[record.get('OID')].getRecord().fireEvent('updated',record);
				return true;
			}

			this._annotations[record.get('OID')] =
				Ext.create(
					'NextThought.view.widgets.annotations.Note',
					record,
					this.items.get(0).el.dom.firstChild,
					this);
			if( this.bufferedDelayedRelayout )
				this.bufferedDelayedRelayout();
			return true;
		}
		catch(e){ console.error('Error notes:',e, e.toString(), e.stack); }

		return false;
	},


	createTranscriptSummaryWidget: function(/*record*/) {
	},


	onNotification: function(change){
		if(!change || !change.get)
			return;//abandon ship!!

		var item = change.get('Item'),
			type = change.get('ChangeType'),
			oid = item? item.getId() : null,
			cid = item? item.get('ContainerId') : null,
            delAction = /deleted/i.test(type),
            cmp = Ext.getCmp(IdCache.getComponentId(oid)),
			cls, replyTo, builder, result;

        console.log('onNotification', change, type);
		if (!item || !this._containerId || this._containerId != cid) {
			return;
		}

		//if exists, update
		if( oid in this._annotations){
			if(delAction){
				this._annotations[oid].cleanup();
				delete this._annotations[oid];
			}
			else {
				this._annotations[oid].getRecord().fireEvent('updated',item);
			}
		}
        //found the component, it's not top level
        else if (cmp) {
            //delete it
            if (delAction) {
                cmp._annotation.cleanup();
            }
            //update it
            else {
                cmp._annotation.getRecord().fireEvent('updated',item);
            }

        }
		//if not exists, add
		else if(!delAction){
			cls = item.get('Class');
			replyTo = item.get('inReplyTo');
			builder = this.widgetBuilder[cls];
			result = builder ? builder.call(this, item) : false;

			if(result === false){
				if (/Note/i.test(cls) && replyTo) {
					replyTo = Ext.getCmp(IdCache.getComponentId(replyTo));
					replyTo.addReply(item);
				}
				else {
					console.error('ERROR: Do not know what to do with this item',item);
				}
			}
		}

		//do we get delete notices?
	},


	loadContentAnnotations: function(containerId){
		this._containerId = containerId;
		this.clearAnnotations();
		this.fireEvent('annotations-load', containerId);
	},


	objectsLoaded: function(bins) {
		var me = this,
			contributors = {},
			k = 'Last Modified',
			tree = {}, b,
			sortedItems;

		if (!this._containerId) return;

		//sort bins
		for(b in bins){
			if(bins.hasOwnProperty(b))
			bins[b] = Ext.Array.sort(bins[b]||[],SortModelsBy(k,ASCENDING,me.GETTERS[b]));
		}

		this.buildAnnotationTree(bins.Note, tree);
		this.buildAnnotationTree(bins.TranscriptSummary, tree);

		sortedItems = Ext.Object.getValues(tree).concat(bins.Highlight);
		//sort
		Ext.Array.sort(sortedItems,this.buildAnchorSorter());

		contributors = this.buildAnnotations(sortedItems);

		me.fireEvent('publish-contributors',contributors);
        me.fireEvent('resize');
	},


	getContributors: function(record){
		var cont = {}, c = record.get('Creator') || record.get('Contributors');
		if(!Ext.isArray(c)) c = [c];
		Ext.each(c, function(i){ if(i && Ext.String.trim(i) !== '')cont[i] = true; });
		return cont;
	},


	buildAnchorSorter: function(){
		var me = this,
			m = 'getAnchorForSort',
			anchors = Ext.Array.map(
					Ext.DomQuery.select('#NTIContent a[name]'),
					function(a){
						return a.getAttribute('name');
					}
			);

		function _(v){
			var r = me.GETTERS[v.getModelName()](v);
			return  r[m]? Ext.Array.indexOf(anchors,r[m]()) : 0;
		}

		return function(a,b){
			var _a = _(a),
				_b = _(b),
				c = 0;

			if( _a != _b ){
				c = _a < _b ? -1:1;
			}
			return c;
		}
	},


	buildAnnotations: function(list){
		var me = this, contributors = {};
		Ext.each(list,
			function(r){
				try{
					Ext.apply(contributors, me.getContributors(r));
					me.widgetBuilder[r.getModelName()].call(me,r);
				}
				catch(e){console.error('Could not build '+r.getModelName()+' from record:', r, 'because: ', e, e.stack); }
			}, this
		);

		return contributors;
	},


	buildAnnotationTree: function(list, tree){
		var me = this;

		Ext.each(list, function buildTree(r){
			var g = me.GETTERS[r.getModelName()](r),
				oid = g.get('OID'),
				parent = g.get('inReplyTo'),
				p;


			r.children = r.children || [];

			if(!(oid in tree))
				tree[oid] = r;

			if(parent){
				p = tree[parent];
				if(!p) p = (tree[parent] = getOID(parent));
				if(!p){
					p = (tree[parent] = AnnotationUtils.replyToPlaceHolder(g));
					buildTree(p);
				}

				p.children = p.children || [];
				p.children.push(r);

				r._parent = parent;
			}
		});

		function getOID(id) {
			var r = null,
				f = function(o)
					{
						if( o && o.get && o.get('OID') == id ) {
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


	onContextMenuHandler: function(e) {
		try{
			e.preventDefault();
			var range = this.getSelection();
			if( range && !range.collapsed ) {
				this.addHighlight(range, e.getXY());
			}
		}
		catch(er){ this.clearSelection(); }
	},



	getSelection: function() {
		var //e = this.getDocumentEl(),
			range, selection;

		if (window.getSelection) {	// all browsers, except IE before version 9
			selection = window.getSelection();
            if (selection.rangeCount > 0) {
				range = selection.getRangeAt(0);

                //TODO: This ONLY works in Chrome beta, for Safari and Crome regular, contains returns false.  Commenting this out for time being.
				//if(!e.contains(range.startContainer) || !e.contains(range.endContainer))
                //  console.log('could not find start container', range.startContainer, ' or end container', range.endContainer, 'in', e);
				//return null;

				return range;
			}
		}
		else {
			if (document.selection) {	// Internet Explorer 8 and below
				range = document.selection.createRange();
				return range.getBookmark();
			}
		}

		return null;
	},


	clearSelection: function(){
		try {
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			}

			if(document.selection)
				document.selection.clear();
		}
		catch(e){ console.warn(e.stack); }
	}


});
