Ext.define('NextThought.mixins.Annotations', {
	requires: [
		'NextThought.model.Highlight',
		'NextThought.model.Note',
		'NextThought.proxy.UserDataLoader',
		'NextThought.util.ParseUtils',
		'NextThought.util.AnnotationUtils',
		'NextThought.util.QuizUtils',
		'NextThought.view.widgets.annotations.SelectionHighlight',
		'NextThought.view.widgets.annotations.Highlight',
		'NextThought.view.widgets.annotations.Note'
	],

	GETTERS : {
		'Note': function(r){return r},
		'TranscriptSummary': function(r){return r.get('RoomInfo')}
	},

	initAnnotations: function(){
		Ext.apply(this,{
			_annotations: {},
			_filter: null,
			_searchAnnotations: null
		});

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
		var _a = this._annotations;

		this._filter = newFilter;
		for(var a in _a) {
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
		for(var oid in this._annotations){
			if(!this._annotations.hasOwnProperty(oid)) continue;

			var v = this._annotations[oid];
			if (!v) continue;
			v.cleanup();
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

		w = this.widgetBuilder['Highlight'].call(this,highlight,range);

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
			return true;
		}
		catch(e){ console.error('Error notes:',e, e.toString(), e.stack); }

		return false;
	},


	createTranscriptSummaryWidget: function(record) {
	},


	onNotification: function(change){
		var item = change && change.get? change.get('Item') : null,
			oid = item? item.get('oid') : null,
			cid = item? item.get('ContainerId') : null;

		if (!item || !this._containerId || this._containerId != cid) {
			return;
		}

		//if exists, update
		if( oid in this._annotations){
			this._annotations[oid].getRecord().fireEvent('updated',item);
		}
		//if not exists, add
		else{
			var cls = item.get('Class'),
				replyTo = item.get('inReplyTo'),
				builder = this.widgetBuilder[cls],
				result = builder ? builder.call(this, item) : null;

			if (/Note/i.test(cls) && result === false && replyTo) {
				replyTo = Ext.getCmp('cmp-'+replyTo);
				replyTo.addReply(item);
			}
			else {
				console.error('ERROR: Do not know what to do with this item', Ext.encode(item));
			}
		}

		//do we get delete notices?
	},


	loadContentAnnotations: function(containerId){
		this._containerId = containerId;
		this.loadObjects();
	},


	loadObjects: function() {
		this.clearAnnotations();
		UserDataLoader.getPageItems(this._containerId, {
			scope:this,
			success: this.objectsLoaded,
			failure: function(){} //TODO: Fill in
		});
	},


	objectsLoaded: function(bins) {
		var me = this,
			contributors = {},
			k = 'Last Modified',
			tree = {};

		if (!this._containerId) return;

		//sort bins
		for(var b in bins){
			if(bins.hasOwnProperty(b))
			bins[b] = Ext.Array.sort(bins[b]||[],SortModelsBy(k,true,me.GETTERS[b]));
		}


		Ext.apply(contributors, this.buildAnnotationTree(bins.Note, tree));
		Ext.apply(contributors, this.buildAnnotationTree(bins.TranscriptSummary, tree));
		Ext.apply(contributors, this.buildSimpleAnnotation(bins.Highlight));

		this.buildTreedAnnotations(tree);

		if( me.bufferedDelayedRelayout)
			me.bufferedDelayedRelayout();

		me.fireEvent('publish-contributors',contributors);
        me.fireEvent('resize');
	},


	getContributors: function(record){
		var cont = {}, c = record.get('Creator') || record.get('Contributors');
		if(!Ext.isArray(c)) c = [c];
		Ext.each(c, function(i){ if(i && Ext.String.trim(i) != '')cont[i] = true; });
		return cont;
	},


	buildSimpleAnnotation: function(list){
		var me = this, contributors = {};
		Ext.each(list,
			function(r){
				try{
					me.widgetBuilder[r.getModelName()].call(me,r);
					Ext.apply(contributors, me.getContributors(r));
				}
				catch(e){console.error('Could not build '+r.getModelName()+' from record:', r, 'because: ', e.stack); }
			}, this
		);

		return contributors;
	},


	buildAnnotationTree: function(list, tree){
		var me = this,
			contributors = {};

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

			Ext.apply(contributors, me.getContributors(g));
		});

		function getOID(id) {
			var r = null;
			var	f = function(o)
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

		return contributors;
	},


	buildTreedAnnotations: function(tree){
		for(var oid in tree){
			var o = tree[oid];
			if(!tree.hasOwnProperty(oid)) continue;

			var b = this.widgetBuilder[o.getModelName()];

			if(b) b.call(this,o);
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
		catch(e){ this.clearSelection(); }
	},



	getSelection: function() {
		if (window.getSelection) {	// all browsers, except IE before version 9
			var selection = window.getSelection();
			if (selection.rangeCount > 0) {
				return selection.getRangeAt(0);
			}
		}
		else {
			if (document.selection) {	// Internet Explorer 8 and below
				var range = document.selection.createRange();
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
