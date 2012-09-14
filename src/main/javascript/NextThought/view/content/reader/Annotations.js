Ext.define('NextThought.view.content.reader.Annotations', {
	requires: [
		'NextThought.model.Highlight',
		'NextThought.model.Note',
		'NextThought.model.Redaction',
		'NextThought.model.TranscriptSummary',
		'NextThought.model.QuizResult',
		'NextThought.util.Annotations',
		'NextThought.ux.SearchHits',
		'NextThought.view.annotations.renderer.Manager',
		'NextThought.view.annotations.Redaction',
		'NextThought.view.annotations.Highlight',
		'NextThought.view.annotations.Note',
		'NextThought.view.annotations.Transcript',
		'NextThought.view.annotations.QuizResults',
		'NextThought.view.assessment.Scoreboard',
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
		var me = this,
			container = Ext.DomHelper.insertAfter(me.getInsertionPoint().first(),
				{ cls:'annotation-gutter', cn:[{cls:'column widgets'},{cls:'column controls'}] },
				true);

		me.on('destroy' , function(){
			container.remove();
		},me);

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
		this.searchAnnotations = Ext.widget('search-hits', {hits: ranges, owner: this});
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
			rect2 = RectUtils.getFirstNonBoundingRect(range),
			record = AnnotationUtils.selectionToHighlight(range, null, me.getDocumentElement()),
			menu,
			offset,
			redactionRegex = /USSC-HTML|Howes_converted|USvJones2012_converted/i,
			boundingBox = me.convertRectToScreen(rect),
			text = range.toString(),
			innerDocOffset;

		if(!record) {
			return;
		}

		record.set('ContainerId', me.containerId);

		menu = Ext.widget('menu',{
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
			minWidth: 150,
			defaults: {ui: 'nt-annotaion', plain: true }
		});

		if(/^\w+$/i.test(text)){//is it a word
			menu.add({
				text: 'Define...',
				handler:function(){
					me.fireEvent('define', text, boundingBox );
					me.clearSelection();
				}
			});
		}

		menu.add({
			text: 'Save Highlight',
			handler:function(){
				me.createAnnotationWidget('highlight',record, range).savePhantom();
				me.clearSelection();
			}
		});

		menu.add({
			text: 'Add Note',
			handler: function(){
				me.clearSelection();
				Ext.apply(me.noteOverlayData,{
					lastLine: {
						rect: rect2,
						range: range,
						style: 'plain'
					},
					suspendMoveEvents: true
				});

				me.noteOverlayPositionInputBox();
				me.noteOverlayActivateRichEditor();
				me.noteOverlayScrollEditorIntoView();
			}
		});

		//TODO - official way of redaction feature enablement:
		//if($AppConfig.service.canRedact()){
		//hack to allow redactions only in legal texts for now...
		if (redactionRegex.test(LocationProvider.currentNTIID)) {
			//inject other menu items:
			menu.add({
				text: 'Redact Inline',
				handler: function(){
					me.clearSelection();
					var r = NextThought.model.Redaction.createFromHighlight(record,false);
					try{
						me.createAnnotationWidget('redaction',r, range).savePhantom();
					}
					catch(e){
						alert('Coud not save redaction');
					}
					me.scrollTo(range.getBoundingClientRect().top);
				}
			});

			menu.add({
				text: 'Redact Block',
				handler: function(){
					me.clearSelection();
					var r = NextThought.model.Redaction.createFromHighlight(record,true);

					try{
						me.createAnnotationWidget('redaction',r, range).savePhantom();
					}
					catch(e){
						alert('Coud not save redaction');
					}
					me.scrollTo(range.getBoundingClientRect().top);
				}
			});
		}



		offset = me.el.getXY();
		innerDocOffset = document.getElementsByTagName('iframe')[0].offsetLeft;
		xy[0] += offset[0] + innerDocOffset;
		xy[1] += offset[1];

		menu.showAt(xy);

		me.selectRange(range);
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
			w = Ext.widget(type.toLowerCase(), {browserRange: browserRange, record: record, reader: this});

			if (!oid) {
				oid = type.toUpperCase()+'-TEMP-OID';
				if (this.annotations[oid]){
					this.annotations[oid].cleanup();
					delete this.annotations[oid];
				}
				w.tempID = oid;
				record.on('updated',function(r){
					this.annotations[r.get('NTIID')] = this.annotations[oid];
					delete this.annotations[oid];
					delete w.tempID;
				}, this);
			}

			this.annotations[oid] = w;
		}
		catch(e){
			console.error(e);
		}
		return w;
	},


	onNoteCreated: function(record, browserRange){
		//check to see if reply is already there, if so, don't do anything...
		if (Ext.getCmp(IdCache.getComponentId(record,null,this.prefix))) {
			return;
		}

		this.createAnnotationWidget('note',record, browserRange);
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
			cmps = Ext.ComponentQuery.query(Ext.String.format('[recordIdHash={0}]' ,IdCache.getIdentifier(oid)))||[],
			cls, result,
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

		Ext.each(cmps,function(cmp){
			//delete it
			if (delAction) {
				cmp.onDelete();
			}
			else {
				cmp.getRecord().fireEvent('changed');
			}
		});

		//if not exists, add
		if(!delAction){
			cls = item.get('Class');
//			replyTo = item.get('inReplyTo');
			result = this.createAnnotationWidget(cls,item) || false;

			if(result === false){
				console.error('ERROR: Do not know what to do with this item',item);
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

			//Handle prior assessments
			this.setAssessedQuestions(bins.AssessedQuestionSet);

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


	setAssessedQuestions: function(sets) {
		if (!sets || sets.length === 0) {
			//do nothing if we have no prior sets
			return;
		}

		var scoreboard = Ext.ComponentQuery.query('assessment-scoreboard')[0];

		if (!scoreboard){
			console.error('Got prior assessments back but there is no scoreboard to associate with', sets);
			return;
		}

		scoreboard.setPriorResults(sets);
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
			var origSelection = window.rangy.getSelection(this.getDocumentElement()).toString(),
				range = this.getSelection();

			if( range && !range.collapsed ) {
				e.stopPropagation();
				e.preventDefault();
				if (origSelection.length > 0) {
					this.addAnnotation(range, e.getXY());
				}
			}
		}
		catch(er){
			console.warn('onContextMenuHandler: '+er.message+' trace: ', er.stack);
		}
	},


	getSelection: function() {


		var doc = this.getDocumentElement(),
			win = doc.parentWindow,
			range, selection;

		Anchors.snapSelectionToWord(doc);

		selection = win.getSelection();
		if (selection.rangeCount > 0) {
			range = selection.getRangeAt(0);

			return range;
		}
		console.warn('skipping getSelection() no ranges', selection);

		return null;
	},


	selectRange: function(range){
		var s = this.getDocumentElement().parentWindow.getSelection();
		s.removeAllRanges();
		s.addRange(range);
	},


	clearSelection: function(){
		var doc = this.getDocumentElement(),
			win = doc.parentWindow;
		try {
				win.getSelection().removeAllRanges();
		}
		catch(e){console.warn(e.stack||e.toString());}
	}
});
