Ext.define('NextThought.mixins.Annotations', {
	requires: [
		'NextThought.model.Highlight',
		'NextThought.model.Note',
		'NextThought.model.TranscriptSummary',
		'NextThought.model.QuizResult',
		'NextThought.util.AnnotationUtils',
		'NextThought.util.QuizUtils',
		'NextThought.view.widgets.annotations.SelectionHighlight',
		'NextThought.view.widgets.annotations.Highlight',
		'NextThought.view.widgets.annotations.Note',
		'NextThought.view.widgets.annotations.Transcript',
		'NextThought.view.widgets.annotations.QuizResults',
		'NextThought.cache.IdCache',
		'NextThought.providers.Contributors'
	],

	GETTERS : {
		'Highlight': function(r){return r;},
		'Note': function(r){return r;},
		'TranscriptSummary': function(r){return r.get('RoomInfo');},
		'QuizResult': function(r){return r;}},

	initAnnotations: function(){
		var me = this;
		Ext.apply(me,{
			annotations: {},
			filter: null,
			searchAnnotations: null
		});

		me.addEvents('share-with','create-note');

		me.widgetBuilder = {
			'Highlight': me.createHighlightWidget,
			'Note': me.createNoteWidget,
			'TranscriptSummary': me.createTranscriptSummaryWidget,
			'QuizResult': me.createQuizResultWidget
		};

		NextThought.controller.Annotations.events.on('new-note',this.onNoteCreated,this);
		NextThought.controller.Stream.registerChangeListener(me.onNotification, me);
		me.on('added',function(){
			FilterManager.registerFilterListener(me, me.applyFilter,me);
		});
	},


	applyFilter: function(newFilter){
		// console.debug('applyFilter:', newFilter);
		var $a = this.annotations, a;

		this.filter = newFilter;
		for(a in $a) {
			if($a.hasOwnProperty(a) && $a[a]) {
				try {
					$a[a].updateFilterState(this.filter);
				}
				catch(e) { console.error('Annotation Filter Error: ', $a, a, newFilter); }
			}
		}
	},


	showRanges: function(ranges) {
		this.searchAnnotations = Ext.create('annotations.SelectionHighlight', ranges,
				this.items.get(0).el.dom.firstChild, this);
	},


	clearSearchRanges: function() {
		if (!this.searchAnnotations) {
			return;
		}

		this.searchAnnotations.cleanup();
		this.searchAnnotations = null;
	},


	removeAnnotation: function(oid) {
		var v = this.annotations[oid];
		if (v) {
			this.annotations[oid] = undefined;
			delete this.annotations[oid];
			v.cleanup();
		}
	},


	clearAnnotations: function(){
		var v, oid;
		for(oid in this.annotations){
			if(this.annotations.hasOwnProperty(oid)) {
				v = this.annotations[oid];
				if (!v) {
					continue;
				}
				v.cleanup(true);
			}
		}

		this.annotations = {};
		this.clearSearchRanges();
	},


	annotationExists: function(record){
		var oid = record.getId();
		if(!oid){
			return false;
		}

		return !!this.annotations[oid];
	},


	addHighlight: function(range, xy){
		if(!range) {
			console.warn('bad range');
			return;
		}

		var highlight = AnnotationUtils.selectionToHighlight(range),
			menu,
			w,offset;

		if(!highlight) {
			return;
		}

		w = this.widgetBuilder.Highlight.call(this,highlight,range);

		highlight.set('ContainerId', this.containerId);

		menu = w.getMenu();
		menu.on('hide', function(){
				if(!w.isSaving){
					w.cleanup();
					delete this.annotations[w.tempID]; //remove the key from the object
				}
			},
			this);

		offset = this.el.getXY();
		xy[0] += offset[0];
		xy[1] += offset[1];

		menu.showAt(xy);
	},


	createHighlightWidget: function(record, r){
		var range = r || AnnotationUtils.buildRangeFromRecord(record, this.getDocumentElement()),
			oid = record.getId(),
			w;

		if (!range) {
			Ext.Error.raise('could not create range');
		}

		if (this.annotationExists(record)) {
			this.annotations[record.getId()].getRecord().fireEvent('updated',record);
			return null;
		}


		w = Ext.widget( 'highlight-annotation', range, record, this);

		if (!oid) {
			oid = 'Highlight-TEMP-OID';
			if (this.annotations[oid]){
				this.annotations[oid].cleanup();
				delete this.annotations[oid];
			}
			w.tempID = oid;
			record.on('updated',function(r){
				this.annotations[r.get('NTIID')] = this.annotations[oid];
				this.annotations[oid] = undefined;
				delete this.annotations[oid];
				delete w.tempID;
			}, this);
		}

		this.annotations[oid] = w;
		return w;
	},


	createNoteWidget: function(record){
		try{
			if(!record.pruned && (record.get('inReplyTo') || record.parent)){
				return false;
			}
			else if (this.annotationExists(record)) {
				this.annotations[record.getId()].getRecord().fireEvent('updated',record);
				return true;
			}

			this.annotations[record.getId()] = Ext.widget( 'note-annotation', record, this);

			return true;
		}
		catch(e){ console.error('Error notes:',e, e.toString(), e.stack); }

		return false;
	},


	createTranscriptSummaryWidget: function(record) {
		if (record.parent) { return; }
		this.annotations[record.getId()] = Ext.widget( 'transcript-annotation', record, this);
		return true;
	},

	createQuizResultWidget: function(record) {
		if (record.parent) { return; }
		this.annotations[record.getId()] = Ext.widget( 'quiz-result-annotation', record, this);
		return true;
	},



	onNoteCreated: function(record){
		//check to see if reply is already there, if so, don't do anything...
		if (Ext.getCmp(IdCache.getComponentId(record,null,this.prefix))) {
			return;
		}

		var parent = record.get('inReplyTo');
		if(parent){
			parent = Ext.getCmp(IdCache.getComponentId(parent,null,this.prefix));
			parent.addReply(record);
		}


		else {
			this.createNoteWidget(record);
		}

		this.fireEvent('resize');
	},



	onNotification: function(change){
		if(!change || !change.get) {
			return;//abandon ship!!
		}

		var item = change.get('Item'),
			type = change.get('ChangeType'),
			oid = item? item.getId() : null,
			cid = item? item.get('ContainerId') : null,
			delAction = /deleted/i.test(type),
			cmp = Ext.getCmp(IdCache.getComponentId(oid, null, this.prefix)),
			cls, replyTo, builder, result;

		console.log('onNotification', change, type);
		if (!item || !this.containerId || this.containerId !== cid) {
			return;
		}

		//if exists, update
		if(this.annotations.hasOwnProperty(oid)) {
			if(delAction){
				this.annotations[oid].cleanup();
				delete this.annotations[oid];
			}
			else {
				this.annotations[oid].getRecord().fireEvent('updated',item);
			}
		}

		//found the component, it's not top level
		else if (cmp) {
			//delete it
			if (delAction) {
				cmp.annotation.cleanup();
			}
			//update it
			else {
				cmp.annotation.getRecord().fireEvent('updated',item);
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
					replyTo = Ext.getCmp(IdCache.getComponentId(replyTo, null, this.prefix));
					replyTo.addReply(item);
				}
				else {
					console.error('ERROR: Do not know what to do with this item',item);
				}
			}
		}

		//do we get delete notices?
	},


	loadContentAnnotations: function(containerId, callback){
		this.containerId = containerId;
		this.clearAnnotations();
		this.fireEvent('annotations-load', this, containerId, callback);
	},


	objectsLoaded: function(bins, callback) {
		var me = this,
			contributors = [],
			k = 'Last Modified',
			tree = {}, b,
			items,
			foundBins;

		if (!this.containerId) {
			return;
		}

		//sort bins
		for(b in bins){
			if(bins.hasOwnProperty(b)){
				bins[b] = Ext.Array.sort(bins[b]||[],Globals.SortModelsBy(k,ASCENDING,me.GETTERS[b]));
				foundBins = true;
			}
		}

		if (foundBins) {
			this.buildAnnotationTree(bins.Note, tree);
			this.buildAnnotationTree(bins.TranscriptSummary, tree);
			this.buildAnnotationTree(bins.QuizResult, tree);

			this.prunePlaceholders(tree);

			items = Ext.Object.getValues(tree).concat(bins.Highlight||[]);

			contributors = this.buildAnnotations(items);
		}

		ContributorsProvider.set(contributors);
		AnnotationUtils.callbackAfterRender(callback,this);
	},


	getContributors: function(record){
		var cont = {}, c = record.get('Creator') || record.get('Contributors');
		if(!Ext.isArray(c)) {
			c = [c];
		}
		Ext.each(c, function(i){ if(i && Ext.String.trim(i) !== '') { cont[i] = true; } });
		return cont;
	},


	buildAnnotations: function(list){
		var me = this, contributors = {};
		Ext.each(list,
			function(r){
				if(!r) {
					return;
				}
				try{
					Ext.apply(contributors, me.getContributors(r));
					me.widgetBuilder[r.getModelName()].call(me,r);
				}
				catch(e) {
					console.error('Could not build '+r.getModelName()+' from record:', r, 'because: ', e, e.stack);
				}
			}, this
		);

		return contributors;
	},


	buildAnnotationTree: function(list, tree){
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
				p.children.push(r);

				r.parent = parent;
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


	prunePlaceholders: function(tree){

		function arePlaceHolders(list){
			var k;
			for(k in list){
				if(list.hasOwnProperty(k) && !list[k].placeHolder) {
					return false;
				}
			}
			return true;
		}

		function canPrune(o){
			return o!==null && !o.parent && o.placeHolder && arePlaceHolders(o.children||[]);
		}

		function needsPruning(){
			var k;
			for(k in tree){
				if(tree.hasOwnProperty(k) && canPrune(tree[k])) {
					return true;
				}
			}
			return false;
		}

		function prune(k,o){
			if(!canPrune(o)) {
				return;
			}
			delete tree[k];
			Ext.each(o.children, function(c){
				delete c.parent;
				c.pruned = true;
			});
		}

		while(needsPruning()){
			Ext.Object.each(tree, prune);
		}
	},


	onContextMenuHandler: function(e) {
		try{
			var range = this.getSelection(),
				target = e.getTarget();

			if(target && /input/i.test(target.tagName)){
				console.log('short-circuit');
				return;
			}

			e.stopPropagation();
			e.preventDefault();

			if( range && !range.collapsed ) {

				this.addHighlight(range, e.getXY());
			}
			this.clearSelection();
		}
		catch(er){
			console.warn(er, er.stack);
		}
	},


	getSelection: function() {
		var doc = this.getDocumentElement(),
			win = doc.ownerWindow,
			range, selection;

		if (win.getSelection) {	// all browsers, except IE before version 9
			selection = win.getSelection();
			if (selection.rangeCount > 0) {
				range = selection.getRangeAt(0);

				return range;
			}
			console.warn('skipping getSelection() no ranges', selection);
		}
		else {
			if (doc.selection) {	// Internet Explorer 8 and below
				range = doc.selection.createRange();
				return range.getBookmark();
			}
		}

		return null;
	},


	clearSelection: function(){
		var doc = this.getDocumentElement(),
			win = doc.ownerWindow;
		try {
			if (win.getSelection) {
				win.getSelection().removeAllRanges();
			}

			if(doc.selection) {
				doc.selection.clear();
			}
		}
		catch(e){ console.warn(e.stack); }
	}


});
