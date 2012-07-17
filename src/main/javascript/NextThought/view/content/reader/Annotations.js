Ext.define('NextThought.view.content.reader.Annotations', {
	requires: [
		'NextThought.model.Highlight',
		'NextThought.model.Note',
		'NextThought.model.Redaction',
		'NextThought.model.TranscriptSummary',
		'NextThought.model.QuizResult',
		'NextThought.util.Annotations',
		'NextThought.util.Quizes',
		'NextThought.ux.SearchHits',
		'NextThought.view.annotations.renderer.Manager',
		'NextThought.view.annotations.Redaction',
		'NextThought.view.annotations.Highlight',
		'NextThought.view.annotations.Note',
		'NextThought.view.annotations.Transcript',
		'NextThought.view.annotations.QuizResults',
		'NextThought.cache.IdCache',
		'NextThought.providers.Contributors'
	],

	GETTERS : {
		'Highlight': function(r){return r;},
		'Note': function(r){return r;},
		'TranscriptSummary': function(r){return r.get('RoomInfo');},
		'QuizResult': function(r){return r;}
	},


	insertAnnotationGutter: function(){
		var me = this;
		var container = Ext.DomHelper.insertAfter(me.body.first(),
				{ cls:'annotation-gutter', cn:[{cls:'column widgets'},{cls:'column controls'}] }, true);
		me.on('destroy' , function(){ container.remove(); },me);

		AnnotationsRenderer.registerGutter(container, me);
	},


	constructor: function(){
		var me = this;
		Ext.apply(me,{
			annotations: {},
			filter: null,
			searchAnnotations: null
		});

		me.addEvents('share-with','create-note');

		NextThought.controller.Annotations.events.on('new-note',this.onNoteCreated,this);
		NextThought.controller.Annotations.events.on('new-redaction',this.onRedactionCreated,this);
		NextThought.controller.Stream.registerChangeListener(me.onNotification, me);

		me.on({
			scope: this,
			added: function(){ FilterManager.registerFilterListener(me, me.applyFilter,me); },
			afterRender: me.insertAnnotationGutter
		});

		return this;
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
		this.clearSearchRanges();
		this.searchAnnotations = Ext.widget({xtype: 'SearchHits', hits: ranges, owner: this});
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
		var v, oid, leftovers;
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

		//Catchall for existing annotations that did not get removed properly or are left
		//hanging like placeholder notes.
		leftovers = Ext.query('[id*=note-container]');
		if (leftovers && leftovers.length > 0) {
			Ext.each(leftovers, function(l){
				Ext.fly(l).destroy();
			});
		}

	},


	annotationExists: function(record){
		var oid = record.getId();
		if(!oid){
			return false;
		}

		return !!this.annotations[oid];
	},


	addAnnotation: function(range, xy){
		if(!range) {
			console.warn('bad range');
			return;
		}

		var me = this,
			rect = range.getBoundingClientRect(),
			record = AnnotationUtils.selectionToHighlight(range, null, me.getDocumentElement()),
			menu,
			w,offset,
			redactionRegex = /USSC-HTML|Howes_converted|USvJones2012_converted/i;

		if(!record) {
			return;
		}

		w = me.createAnnotationWidget('highlight',record, range);

		record.set('ContainerId', me.containerId);

		menu = w.getMenu();

		menu.add({
			text: 'Add Note',
			handler: function(){
				Ext.apply(me.noteOverlayData,{
					lastLine: {
						rect: rect,
						range: range,
						style: 'plain'
					},
					suspendMoveEvents: true
				});
				me.noteOverlayPositionInputBox();
				me.noteOverlayActivateRichEditor();
			}
		});

		//hack to allow redactions only in legal texts for now...
		if (redactionRegex.test(LocationProvider.currentNTIID)) {
			//inject other menu items:
			menu.add({
				text: 'Redact Inline',
				handler: function(){
					var r = NextThought.model.Redaction.createFromHighlight(record);
					r.set('replacementContent', 'redaction');
					var widget = me.createAnnotationWidget('redaction',r, range);
					widget.savePhantom();
				}
			});

			menu.add({
				text: 'Redact Block',
				handler: function(){
					var r = NextThought.model.Redaction.createFromHighlight(record);
					var widget = me.createAnnotationWidget('redaction',r, range);
					widget.savePhantom();
				}
			});
		}

		menu.on('hide', function(){
				if(!w.isSaving){
					delete w.range;
					w.cleanup();
					delete me.annotations[w.tempID]; //remove the key from the object
				}
			});

		offset = me.el.getXY();
		xy[0] += offset[0];
		xy[1] += offset[1];

		menu.showAt(xy);
	},


	/**
	 *
	 * @param type
	 * @param record - annotation record (highlight, note, redaction, etc)
	 * @param [browserRange] - optional, if we already have a range from the browser, that can be used instead of resolving it
	 *                         from the record
	 * @return {*}
	 */
	createAnnotationWidget: function(type, record, browserRange){
		var oid = record.getId(),
			style = record.get('style'),
			w;

		if(!record.pruned && (record.get('inReplyTo') || record.parent)){
			return false;
		}
		else if (this.annotationExists(record)) {
			this.annotations[record.getId()].getRecord().fireEvent('updated',record);
			return true;
		}

		try {
			w = Ext.widget({xtype: type.toLowerCase(), browserRange: browserRange, record: record, reader: this});

			if (!oid) {
				oid = type.toUpperCase()+'-TEMP-OID';
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
		}
		catch(e){
			console.error(e.stack);
		}
		return w;
	},


	onNoteCreated: function(record, browserRange){
		//check to see if reply is already there, if so, don't do anything...
		if (Ext.getCmp(IdCache.getComponentId(record,null,this.prefix))) {
			return;
		}

//		var parent = record.get('inReplyTo');
//		if(parent){
//			parent = Ext.getCmp(IdCache.getComponentId(parent,null,this.prefix));
//			if (parent){parent.addReply(record);}
//		}
//		else {
			this.createAnnotationWidget('note',record, browserRange);
//		}
	},


	onRedactionCreated: function(record){
		this.createAnnotationWidget('redaction',record);
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
			creator = item? item.get('Creator') : null,
			delAction = /deleted/i.test(type),
			cmp = Ext.getCmp(IdCache.getComponentId(oid, null, this.prefix)),
			cls, replyTo, result,
			contribNS = Globals.getViewIdFromComponent(this);

		if (!item || !this.containerId || this.containerId !== cid) {
			return;
		}

		//do some contributor updates
		if (delAction) {
			ContributorsProvider.remove(creator, contribNS);
		}
		else {
			ContributorsProvider.add(creator, contribNS);
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
			result = this.createAnnotationWidget(cls,item) || false;

			if(result === false){

//				if (replyTo) {
//					replyTo = Ext.getCmp(IdCache.getComponentId(replyTo, null, this.prefix));
//					replyTo.addReply(item);
//				}
//				else {
					console.error('ERROR: Do not know what to do with this item',item);
//				}
			}
		}
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
			foundBins,
			contribNS = Globals.getViewIdFromComponent(this);

		if (!this.containerId) {
			return;
		}

		//sort bins
		for(b in bins){
			if(bins.hasOwnProperty(b)){
				bins[b] = Ext.Array.sort(bins[b]||[],Globals.SortModelsBy(k,me.GETTERS[b]));
				foundBins = true;
			}
		}

		if (foundBins) {
			this.buildAnnotationTree(bins.Note, tree);
			this.buildAnnotationTree(bins.TranscriptSummary, tree);
			this.buildAnnotationTree(bins.QuizResult, tree);

			this.prunePlaceholders(tree);
			items = Ext.Object.getValues(tree).concat(bins.Highlight||[]).concat(bins.Redaction||[]);
			
			contributors = this.buildAnnotations(items);
		}

		ContributorsProvider.set(contributors, contribNS);
		AnnotationUtils.callbackAfterRender(callback,this);
	},


	getContributors: function(record){
		var cont = [],
			c = record.get('Creator') || record.get('Contributors');
		if(!Ext.isArray(c)) {
			c = [c];
		}
		Ext.each(c, function(i){ if(i && Ext.String.trim(i) !== '') { cont.push(i); } });
		return cont;
	},


	buildAnnotations: function(list){
		var me = this, contributors = [];
		Ext.each(list,
			function(r){
				if(!r) {
					return;
				}
				try{
					Ext.Array.insert(contributors, 0, me.getContributors(r));
					me.createAnnotationWidget(r.getModelName(),r);
					AnnotationsRenderer.aboutToRender = true;
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


	prunePlaceholders: function(tree){

		function canPrune(o){
			return o!==null && !o.parent && o.placeHolder;
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
			var range = this.getSelection();

			if( range && !range.collapsed ) {
				e.stopPropagation();
				e.preventDefault();
				this.addAnnotation(range, e.getXY());
				this.clearSelection();
			}
		}
		catch(er){
			console.warn('onContextMenuHandler: '+er.message+' trace: ', er.stack);
		}
	},


	getSelection: function() {
		this.snapSelectionToWord();

		var doc = this.getDocumentElement(),
			win = doc.parentWindow,
			range, selection;

		selection = win.getSelection();
		if (selection.rangeCount > 0) {
			range = selection.getRangeAt(0);

			return range;
		}
		console.warn('skipping getSelection() no ranges', selection);

		return null;
	},


	clearSelection: function(){
		var doc = this.getDocumentElement(),
			win = doc.parentWindow;
		try {
				win.getSelection().removeAllRanges();
		}
		catch(e){console.warn(e.stack||e.toString());}
	},


	/*
	 * Snap the selection to whole words as opposed to partial words.  This code is taken and only
	 * minimally adjusted, from here:
	 * http://stackoverflow.com/questions/10964016/how-do-i-extend-selection-to-word-boundary-using-javascript-once-only/10964743#10964743
	 */
	snapSelectionToWord: function() {
		var sel,
			doc = this.getDocumentElement(),
			window = doc.parentWindow;

		// Check for existence of window.getSelection() and that it has a
		// modify() method. IE 9 has both selection APIs but no modify() method.
		if (window.getSelection && (sel = window.getSelection()).modify) {
			sel = window.getSelection();
			if (!sel.isCollapsed) {

				// Detect if selection is backwards
				var range = doc.createRange();
				range.setStart(sel.anchorNode, sel.anchorOffset);
				range.setEnd(sel.focusNode, sel.focusOffset);
				var backwards = range.collapsed;
				range.detach();

				// modify() works on the focus of the selection
				var endNode = sel.focusNode, endOffset = sel.focusOffset;
				sel.collapse(sel.anchorNode, sel.anchorOffset);

				var direction = [];
				if (backwards) {
					direction = ['backward', 'forward'];
				} else {
					direction = ['forward', 'backward'];
				}

				sel.modify("move", direction[0], "character");
				sel.modify("move", direction[1], "word");
				sel.extend(endNode, endOffset);
				sel.modify("extend", direction[1], "character");
				sel.modify("extend", direction[0], "word");
			}
		} else if ( !!(sel = doc.selection) && sel.type !== "Control") {
			var textRange = sel.createRange();
			if (textRange.text) {
				textRange.expand("word");
				// Move the end back to not include the word's trailing space(s),
				// if necessary
				while (/\s$/.test(textRange.text)) {
					textRange.moveEnd("character", -1);
				}
				textRange.select();
			}
		}
	}
});
