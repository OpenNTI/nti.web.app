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
		'NextThought.cache.IdCache'
	],


	constructor: function(){
		var me = this, c = NextThought.controller;
		Ext.apply(me,{
			annotations: {},
			filter: null,
			searchAnnotations: null
		});

		me.addEvents('share-with','create-note');

		this.mon(c.UserData.events,{
			scope: this,
			'new-note':this.onNoteCreated,
			'new-redaction':this.onRedactionCreated
		});

		c.Stream.registerChangeListener(me.onNotification, me);

		me.on({
			scope: this,
			added: function(){ FilterManager.registerFilterListener(me, me.applyFilter,me); },
			afterRender: me.insertAnnotationGutter
		});

		return this;
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



	loadContentAnnotations: function(containerId, subContainers){
		this.clearAnnotations();
		this.fireEvent('annotations-load', this, containerId, subContainers);
	},


	objectsLoaded: function(items, bins, containerId) {
		var me = this;

		me.setAssessedQuestions((bins||{}).AssessedQuestionSet);
		me.buildAnnotations(items);
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
				cmps = Ext.ComponentQuery.query(Ext.String.format('[recordIdHash={0}]' ,IdCache.getIdentifier(oid)))||[],
				cls, result,
				found = cid === LocationProvider.currentNTIID;

		if(!found){
			Ext.each(this.getDocumentElement().querySelectorAll('[data-ntiid]'),function(o){
				found = o.getAttribute('data-ntiid')===cid;
				return !found;
			});
		}

		if (!item || !cid || !found) {
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


	applyFilter: function(newFilter){
		this.filter = newFilter;
		this.clearAnnotations();
		this.fireEvent('filter-annotations',this);
	},


	showSearchHit: function(hit) {
		this.clearSearchHit();
		this.searchAnnotations = Ext.widget('search-hits', {hit: hit, ps: hit.get('PhraseSearch'), owner: this});
	},

	getSearchHitLocation: function(){
		return this.searchAnnotations.firstHitLocation();
	},

	clearSearchHit: function() {
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
		this.clearSearchHit();

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
				text = range.toString().trim(),
				innerDocOffset;

		if(!record) {
			return;
		}

		//Default container, this should be replaced with the local container.
		record.set('ContainerId', LocationProvider.currentNTIID);

		menu = Ext.widget('menu',{
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
            closeAction: 'destroy',
			minWidth: 150,
			defaults: {ui: 'nt-annotaion', plain: true }
		});

		if(/^\w+$|^\w+\s+\w+$/i.test(text)){//it is one or two words
			//if(/^\w+$/i.test(text)){//is it a word
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
				me.createAnnotationWidget('highlight',record, range).savePhantom(
                    function(){
                       AnnotationUtils.addToHistory(record);
                    }
                );
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
				}
			});
		}

        //on close make sure it get's destroyed.
        menu.on('hide', function(){menu.close();});




		offset = me.el.getXY();
		innerDocOffset = document.getElementsByTagName('iframe')[0].offsetLeft;
		xy[0] += offset[0] + innerDocOffset;
		xy[1] += offset[1];


		if (LocationProvider.currentNTIID.indexOf('mathcounts') < 0) {
			console.debug('hack alert, annotation context menu not showing while in mathcounts content...');
			menu.showAt(xy);
		}

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
				oid = type.toUpperCase()+'-TEMP-OID-' + guidGenerator();
				if (this.annotations[oid]){
					this.annotations[oid].cleanup();
					delete this.annotations[oid];
				}
				record.on('updated',function(r){
					this.annotations[r.get('NTIID')] = this.annotations[oid];
					delete this.annotations[oid];
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
		var me = this;
		Ext.each(list||[], function(r){
			if(!r) { return; }
			try{
				me.createAnnotationWidget(r.getModelName(),r);
			}
			catch(e) {
				console.error('Could not build '+r.getModelName()+' from record:', r, 'because: ', e, e.stack);
			}

		}, this );
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
			console.error('onContextMenuHandler: '+er.message);
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
