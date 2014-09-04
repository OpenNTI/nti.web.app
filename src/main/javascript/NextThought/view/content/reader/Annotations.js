Ext.define('NextThought.view.content.reader.Annotations', {
	alias: 'reader.annotations',
	requires: [
		'NextThought.model.Highlight',
		'NextThought.model.Note',
		'NextThought.model.Redaction',
		'NextThought.model.TranscriptSummary',
		'NextThought.model.QuizResult',
		'NextThought.util.Annotations',
		'NextThought.util.Color',
		'NextThought.ux.SearchHits',
		'NextThought.view.annotations.renderer.Manager',
		'NextThought.view.annotations.Redaction',
		'NextThought.view.annotations.Highlight',
		'NextThought.view.annotations.Note',
		'NextThought.view.annotations.Transcript',
		'NextThought.view.annotations.QuizResults',
		'NextThought.view.assessment.Scoreboard',
		'NextThought.cache.IdCache',
		'NextThought.util.Search',
		'NextThought.util.TextRangeFinder'
	],
	mixins: {
		observable: 'Ext.util.Observable'
	},


	getBubbleTarget: function() {
		return this.reader;
	},


	constructor: function(config) {
		Ext.apply(this, config);
		var me = this,
				reader = me.reader;

		me.up = reader.up.bind(reader);
		me.mixins.observable.constructor.apply(me);

		reader.on('destroy', 'destroy',
				  reader.relayEvents(me, [
					  'filter-by-line',
					  'removed-from-line',
					  'annotations-load',
					  'filter-annotations',
					  'define',
					  'save-phantom',
					  'create-note',
					  'share-with',
					  'resize'
				  ]));

		Ext.apply(me, {
			annotations: {},
			filter: null,
			searchAnnotations: null,
			annotationManager: new NextThought.view.annotations.renderer.Manager(reader)
		});

		reader.on('afterRender', function() {
			reader.fireEvent('listens-to-page-stores', this, {
				scope: this,
				add: 'storeEventsAdd',
				'paged-in': 'storeEventsAdd',
				remove: 'storeEventsRemove',
				bulkremove: 'storeEventsBulkRemove'
			});
		}, this);

		me.mon(reader, {
			scope: this,
			//added: function(){ FilterManager.registerFilterListener(me, me.applyFilter,me); },
			afterRender: 'insertAnnotationGutter',
			'load-annotations': 'loadAnnotations',
			'clear-annotations': 'clearAnnotations',
			'location-cleared': 'clearAnnotations'
		});

		me.mon(me.annotationManager.events, 'finish', function(c) {
			me.fireEvent('rendered', c);
		}, me, {buffer: 500});
	},


	getDocumentElement: function() {
		return this.reader.getDocumentElement();
	},


	onGutterClicked: function(e) {
		var t = e.getTarget('[data-line]', null, true),
				toggle = t && t.hasCls('active'),
				line = !toggle && t && parseInt(t.getAttribute('data-line'), 10);

		this.fireEvent('filter-by-line', this.reader, line);
		this.gutterEl.select('[data-line]').removeCls('active');
		if (t && !toggle) {
			t.addCls('active');
		}
	},


	storeEventsAdd: function(store, records) {
		console.debug('New records in store, adding to page...', store.cacheMapId || store.containerId, records);
		Ext.each(records, function(r) {
			var cls = r.get('Class');
			if (!this.createAnnotationWidget(cls, r)) {
				console.warn('Apparently this record didn\'t get added', r);
			}
			else {
				console.debug('Added ' + cls, r.getId(), 'w/ body:', r.get('body'));
			}
		}, this);
	},


	storeEventsBulkRemove: function(store, records) {
		Ext.each(records, function(record) {
			this.remove(record.getId());
		}, this);
	},


	storeEventsRemove: function(store, record) {
		this.remove(record.getId());
	},


	insertAnnotationGutter: function() {
		var me = this,
				container = Ext.DomHelper.insertAfter(
						me.reader.getInsertionPoint().first(),
						{ cls: 'annotation-gutter', onclick: 'void(0)', cn: {cls: 'column controls'} },
						true);

		me.gutterEl = container;
		me.reader.on('destroy', 'remove', container);
		me.reader.on('sync-height', 'setHeight', container);
		me.mon(container, 'click', 'onGutterClicked', me);
		me.annotationManager.registerGutter(container, me.reader);
	},


	getManager: function() {
		return this.annotationManager;
	},


	convertRectToScreen: function(r) {
		var iframe = this.reader.getIframe().get(),
				result;

		result = {
			top: r.top + iframe.getY(),
			left: r.left + iframe.getX(),
			right: r.right + iframe.getX(),
			bottom: r.bottom + iframe.getY(),
			height: r.height,
			width: r.width
		};
		return result;
	},


	loadAnnotations: function(containerId, subContainers) {
		this.clearAnnotations();
		this.fireEvent('annotations-load', this.reader, containerId, subContainers);
	},


	objectsLoaded: function(items, bins/*, containerId*/) {
		var me = this;

		me.setAssessedQuestions((bins || {}).AssessedQuestionSet);
		me.buildAnnotations(items);
	},


	applyFilter: function(newFilter) {
		this.filter = newFilter;
		this.clearAnnotations();
		this.fireEvent('filter-annotations', this.reader);
	},


	showSearchHit: function(hit) {
		this.clearSearchHit();
		if (hit.isContent()) {
			this.searchAnnotations = Ext.widget('search-hits', {hit: hit, ps: hit.get('PhraseSearch'), owner: this.reader});
		}
	},


	//generalize this
	//Returns an array of objects with two propertes.  ranges is a list
	//of dom ranges that should be used to position the highlights.
	//key is a string that used to help distinguish the type of content when we calculate the adjustments( top and left ) needed.
	rangesForSearchHits: function(hit) {
		var phrase = hit.get('PhraseSearch'),
		//fragments = hit.get('Fragments'),
				regex, ranges,
				o = this.reader.getComponentOverlay(),
				contentDoc = this.getDocumentElement(), indexedOverlayData, result = [];


		console.log('Getting ranges for search hits');

		//We get ranges from two places, the iframe content
		//and the overlays
		regex = SearchUtils.contentRegexForSearchHit(hit, phrase);
		ranges = TextRangeFinderUtils.findTextRanges(contentDoc, contentDoc, regex);
		result.push({
						ranges: ranges.slice(),
						key: 'content'
					});

		//Now look in assessment overlays
		indexedOverlayData = TextRangeFinderUtils.indexText(o.componentOverlayEl.dom, function(node) {
			return Ext.fly(node).parent('.indexed-content');
		});

		ranges = TextRangeFinderUtils.findTextRanges(o.componentOverlayEl.dom,
													 o.componentOverlayEl.dom.ownerDocument,
													 regex, undefined, indexedOverlayData);
		result.push({
						ranges: ranges.slice(),
						key: 'assessment'
					});

		return result;
	},


	//	@returns an object with top and left properties used to adjust the
	//  coordinate space of the ranges bounding client rects.
	//  It decides based on the type of container( main content or overlays).
	getRangePositionAdjustments: function(key) {
		var annotationOffsets, overlayXAdjustment, overlayYAdjustment;
		if (key === 'content') {
			return {top: 0, left: 0};
		}

		//For other overlays( i.e assessments )
		annotationOffsets = this.reader.getAnnotationOffsets();
		overlayYAdjustment = -annotationOffsets.top;
		overlayXAdjustment = -annotationOffsets.left;
		return {top: overlayYAdjustment, left: overlayXAdjustment };
	},


	clearSearchHit: function() {
		if (!this.searchAnnotations) {
			return;
		}

		this.searchAnnotations.cleanup();
		this.searchAnnotations = null;
	},


	remove: function(oid) {
		var v = this.annotations[oid];
		if (v) {
			this.annotations[oid] = undefined;
			delete this.annotations[oid];
			v.cleanup();
			this.fireEvent('removed-from-line', this.reader);
		}
	},


	clearAnnotations: function() {
		var v, oid, leftovers;
		for (oid in this.annotations) {
			if (this.annotations.hasOwnProperty(oid)) {
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
			Ext.each(leftovers, function(l) {
				Ext.fly(l).destroy();
			});
		}

	},


	exists: function(record) {
		var oid = record.getId();
		if (!oid) {
			return false;
		}

		return !!this.annotations[oid];
	},


	getDefinitionMenuItem: function(range) {
		try {
			range = range || this.getSelection();
			if (!range) {
				return null;
			}
			var me = this,
					boundingBox = me.convertRectToScreen(range.getBoundingClientRect()),
					text = range.toString().trim(),
					result = null;

			//Rangy likes to grab trailing punctuation so strip
			//it here
			text = text.replace(/^[^\w]+|[^\w]+$/g, '');

			if (/^\w+$|^\w+[^\w]+\w+$/i.test(text)) {//it is one or two words
				result = {
					text: 'Define...',
					cls: 'define',
					handler: function() {
						me.fireEvent('define', text, boundingBox, me.reader);
						me.clearSelection();
					}
				};
			}

			return result;

		}
		catch (e) {
			console.error(e.message, e.stack);
			return null;
		}
	},


	addAnnotation: function(range, xy) {
		if (!range) {
			console.warn('bad range');
			return;
		}

		if (!xy || !Boolean(xy[0]) || !Boolean(xy[1])) {
			console.warn('xy are null or undefined: ', xy);
			return;
		}

		var me = this,
			rect2 = RectUtils.getFirstNonBoundingRect(range),
			record = AnnotationUtils.selectionToHighlight(range, null, me.getDocumentElement()),
			highlightColors = Service.getHighlightColors(), // array of objects: {name:'blue',color:'0000ff'}
			menu,
			define,
			redactionRegex = /USSC-HTML|Howes_converted|USvJones2012_converted/i,
			frame = me.reader.getIframe().get(),
			win = frame && frame.win;

		if (!record) {
			return;
		}

		//Default container, this should be replaced with the local container.
		if (!record.get('ContainerId')) { record.set('ContainerId', this.reader.getLocation().NTIID); }

		//set a flag to prevent NoteOverlay from resolving the line
		this.reader.creatingAnnotation = true;

		menu = Ext.widget('menu', {
			closeAction: 'destroy',
			minWidth: 4,
			ui: 'nt-annotation',
			cls: 'nt-annotation-menu',
			layout: 'hbox',
			focusOnToFront: false,
			defaults: {ui: 'nt-annotation', plain: true }
		});

		if (win && $AppConfig.allowPrintingContent) {
			menu.add({
				text: getString('NextThought.view.content.reader.Annotations.print'),
				handler: function() { win.print(); }
			});
		}

		menu.add({
			xtype: 'colorpicker',
			colors: Ext.Array.pluck(highlightColors, 'color'), // hex codes are case sensitive. won't work if 'FF' is 'ff'.
			cls: 'nt-highlight-picker',
			plain: false,
			listeners: {
				select: function(picker, selColor) {
					var hColor = Ext.Array.findBy(highlightColors, function(item) {return item.color === selColor;});
					record.set('fillColor', Color.toRGBA(selColor));
					record.set('presentationProperties', {highlightColorName: hColor.name});
					me.fireEvent('save-phantom', record, false);
					me.clearSelection();
					menu.hide();
				}
			}
		});


		define = me.getDefinitionMenuItem(range);
		if (define) {
			menu.add(define);
		}

		if (!this.reader.getNoteOverlay().disabled) {
			menu.add({
				text: getString('NextThought.view.content.reader.Annotations.add-note'),
				cls: 'add-note',
				handler: function() {
					me.clearSelection();
					me.fireEvent('create-note', range, rect2, 'plain');
				}
			});
		}

		function redaction(block) {
			return function() {
				me.clearSelection();
				var r = NextThought.model.Redaction.createFromHighlight(record, block);
				try {
					me.fireEvent('save-phantom', r, true);
				}
				catch (e) {
					alert(getString('NextThought.view.content.reader.Annotations.error'));
				}
			};
		}


		//FIXME - official way of redaction feature enablement:
		//if(Service.canRedact()){
		//hack to allow redactions only in legal texts for now...
		if (redactionRegex.test(this.reader.getLocation().NTIID)) {
			//inject other menu items:
			menu.add({
						 text: getString('NextThought.view.content.reader.Annotations.redact-inline'),
						 handler: redaction(false)
					 });

			menu.add({
						 text: getString('NextThought.view.content.reader.Annotations.redact-block'),
						 handler: redaction(true)
					 });
		}

		//on close make sure it gets destroyed.
		menu.on('hide', function() {
			menu.close();
			delete this.reader.creatingAnnotation;
		}, this);

		// identify the top coordinate of the nearest client rect (nearest line of text)
		// so we can position the menu consistently instead of relying solely on the y coordinate
		// of the mouse event.
		function nearestTextTopOffset(range, xy) {
			var rects = range.getClientRects(),
				scrollOffset = me.reader.getScroll().get().top,
				targetY = xy[1],
				miny, i = 0;
			for (i; i < rects.length; i++) {
				var dy = Math.abs(targetY - rects[i].top + scrollOffset);
				miny = Math.min(miny, dy) || dy;
				//showRect(r);
			}
			return miny;
		}

		// debug utility for visualizing where the given rect is on the page.
		/*function showRect(rect) {
			var offset = me.reader.getEl().getXY();
			var scroll = me.reader.getScroll().get().top;
			var d = document.createElement('div');
			d.style.position = 'absolute';
			d.style.top = (rect.top + offset[1] - scroll) + 'px';
			d.style.left = (rect.left + offset[0]) + 'px';
			d.style.border = '1px solid red';
			d.style.width = rect.width + 'px';
			d.style.height = rect.height + 'px';
			d.style.zIndex = 9999;
			document.body.appendChild(d);
		}*/

		function menuPosition(range, xy) {
			var yoffset = (nearestTextTopOffset(range, xy) || 0);
			var x = xy[0] - (menu.getWidth() / 2);
			var y =	xy[1] - menu.getHeight() - yoffset - 10;
			var offset = me.reader.getEl().getXY();
			x += offset[0];
			y += offset[1];
			return [x, y];
		}

		if (this.reader.getLocation().NTIID.indexOf('mathcounts') < 0) {
			menu.showAt(xy); // opacity still at 0 via css so we can center it. (we can't get the dimensions until it renders)
			menu.setXY(menuPosition(range, xy), false); // center it
			menu.addClass('visible'); // show it.
		} else {
			console.debug('hack alert; annotation context menu deliberately hidden in mathcounts content');
			return;
		}
		me.selectRange(range);
	},


	// For compatibility with native scrolling on iPad
	iAddAnnotation: function(range) {
		if (!range) {
			console.warn('bad range');
			return;
		}

		var me = this,
			rect2,
			record,
			menu,
			xy,
			offset,
			redactionRegex = /USSC-HTML|Howes_converted|USvJones2012_converted/i,
			innerDocOffset;

		function createHighlight() {
			rect2 = RectUtils.getFirstNonBoundingRect(range);
			record = AnnotationUtils.selectionToHighlight(range, null, me.getDocumentElement());
			if (!record) {
				return;
			}
			//Default container, this should be replaced with the local container.
			if (!record.get('ContainerId')) { record.set('ContainerId', me.reader.getLocation().NTIID); }
			me.selectRange(range);
		}

		//set a flag to prevent NoteOverlay from resolving the line
		this.reader.creatingAnnotation = true;

		menu = Ext.widget('menu', {
			closeAction: 'destroy',
			minWidth: 150,
			defaults: {ui: 'nt-annotaion', plain: true }
		});

		menu.add({
					 text: getString('NextThought.view.content.reader.Annotations.save-highlight'),
					 handler: function() {
						 createHighlight();
						 me.fireEvent('save-phantom', record, false);
					 }
				 });

		menu.add({
					 text: getString('NextThought.view.content.reader.Annotations.add-note'),
					 handler: function() {
						 createHighlight();
						 me.fireEvent('create-note', range, rect2, 'plain');
					 }
				 });


		function redaction(block) {
			return function() {
				createHighlight();
				me.clearSelection();
				var r = NextThought.model.Redaction.createFromHighlight(record, block);
				try {
					me.fireEvent('save-phantom', r, true);
				}
				catch (e) {
					alert(getString('NextThought.view.content.reader.Annotations.error'));
				}
			};
		}


		//FIXME - official way of redaction feature enablement:
		//if(Service.canRedact()){
		//hack to allow redactions only in legal texts for now..
		if (redactionRegex.test(this.reader.getLocation().NTIID)) {
			//inject other menu items:
			menu.add({
						text: getString('NextThought.view.content.reader.Annotations.redact-inline'),
						handler: redaction(false)
					 });

			menu.add({
						 text: getString('NextThought.view.content.reader.Annotations.redact-block'),
						 handler: redaction(true)
					 });
		}

		//on close make sure it gets destroyed.
		menu.on('hide', function() {
			menu.close();
			delete this.reader.creatingAnnotation;
		}, this);

		xy = [
			range.getBoundingClientRect().right,
			range.getBoundingClientRect().bottom
		];
		offset = me.reader.getEl().getXY();
		innerDocOffset = document.getElementsByTagName('iframe')[0].offsetLeft;
		xy[0] += offset[0] + innerDocOffset;
		xy[1] += offset[1] - me.reader.getScroll().get().top;

		if (this.reader.getLocation().NTIID.indexOf('mathcounts') < 0) {
			menu.showAt(xy);
		} else {
			console.debug('hack alert; annotation context menu deliberately hidden in mathcounts content');
		}
	},


	/**
	 *
	 * @param {String} type
	 * @param {Ext.data.Model} record - annotation record (highlight, note, redaction, etc)
	 * @param {Range} [browserRange] - optional, if we already have a range from the browser, that can be used instead of resolving it
	 *                         from the record
	 * @param {Function} [onCreated] - Function
	 * @return {*}
	 */
	createAnnotationWidget: function(type, record, browserRange, onCreated) {
		var oid = record.getId(),
				style = record.get('style'),
				w;

		if (record.get('inReplyTo') || record.parent) {
			return false;
		}

		if (this.exists(record)) {
			console.log('Updating existing annotation?');
			this.annotations[record.getId()].getRecord().fireEvent('updated', record);
			return true;
		}

		try {
			w = Ext.widget(type.toLowerCase(), {browserRange: browserRange, record: record, reader: this.reader});

			if (!oid) {
				oid = type.toUpperCase() + '-TEMP-OID-' + guidGenerator();
				if (this.annotations[oid]) {
					this.annotations[oid].cleanup();
					delete this.annotations[oid];
				}
				record.on('updated', function(r) {
					this.annotations[r.get('NTIID')] = this.annotations[oid];

					delete this.annotations[oid];
				}, this);

				w.tempId = oid;
			}

			this.annotations[oid] = w;
			Ext.callback(onCreated, w, [w]);
		}
		catch (e) {
			console.error(Globals.getError(e));
		}

		if (w && type === 'redaction') {
			this.fireEvent('resize');
		}
		return Boolean(w);
	},


	setAssessedQuestions: function(sets) {
		if (!sets || sets.length === 0) {
			//do nothing if we have no prior sets
			return;
		}

		var scoreboard = Ext.ComponentQuery.query('assessment-scoreboard')[0];

		if (!scoreboard) {
			console.error('Got prior assessments back but there is no scoreboard to associate with', sets);
			return;
		}

		scoreboard.setPriorResults(sets);
	},


	buildAnnotations: function(list) {
		var me = this;
		Ext.each(list || [], function(r) {
			if (!r) {
				return;
			}
			try {
				me.createAnnotationWidget(r.getModelName(), r);
			}
			catch (e) {
				console.error('Could not build ' + r.getModelName() + ' from record:', r, 'because: ', e, e.stack);
			}

		}, this);
	},


	onContextMenuHandler: function(e) {
		try {
			var origSelection = window.rangy.getSelection(this.getDocumentElement()).toString(),
					range = this.getSelection();

			if (range && !range.collapsed) {
				e.stopPropagation();
				e.preventDefault();
				if (origSelection.length > 0) {
					if (Ext.is.iPad) { // For compatibility with native highlighting on iPad
						this.iAddAnnotation(range);
					}
					else {
						this.addAnnotation(range, e.getXY());
					}
				}
			}
		}
		catch (er) {
			console.error('onContextMenuHandler: ' + er.message);
		}
	},


	getSelection: function() {
		var doc = this.getDocumentElement(),
				range, selection, txt;
		try {
			selection = doc.parentWindow.getSelection();
			txt = selection.toString();

			if (selection.rangeCount > 0 && !(/^\s*$/).test(txt)) {
				range = selection.getRangeAt(0);

				return range;
			}
		} catch (e) {
			console.error(e.stack || e.message || e);
		}
		console.warn('skipping getSelection() no viable selection', selection);

		return null;
	},


	selectRange: function(range) {
		try {
			var s = this.getDocumentElement().parentWindow.getSelection();
			s.removeAllRanges();
			s.addRange(range);
		}
		catch (e) {
			console.error(e.stack || e.message || e);
		}
	},


	clearSelection: function() {
		var doc = this.getDocumentElement(),
				win = doc.parentWindow;
		try {
			win.getSelection().removeAllRanges();
		}
		catch (e) {
			console.warn(e.stack || e.toString());
		}
	}
});
