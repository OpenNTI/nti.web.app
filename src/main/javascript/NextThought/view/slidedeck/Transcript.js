Ext.define('NextThought.view.slidedeck.Transcript', {
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-transcript',
	requires: [
		'NextThought.layout.component.Natural',
		'NextThought.util.Store',
		'NextThought.view.video.transcript.Transcript',
		'NextThought.view.content.reader.NoteOverlay',
		'NextThought.view.slidedeck.transcript.NoteOverlay',
		'NextThought.view.slidedeck.transcript.Slide',
		'NextThought.view.annotations.renderer.Manager',
		'NextThought.view.annotations.View',
		'NextThought.view.slidedeck.transcript.VideoTitle'
	],

	ui: 'transcript',
	cls: 'transcript-view scrollable',
	items: [],

	desiredTop: 0,

	lineFilterId: 'plinefilter',

	bubbleEvents: ['add', 'remove', 'editor-open', 'editorActivated', 'editorDeactivated'],

	mixins: {
		searchHitHighlighting: 'NextThought.mixins.SearchHitHighlighting'
	},

	initComponent: function() {
		this.enableBubble(['presentation-parts-ready', 'no-presentation-parts', 'jump-video-to']);

		//TODO: this needs to be more centralized.
		if (this.slideStore) {
			this.buildPresentationTimeLine(this.slideStore, this.transcriptStore);
			this.hasSlides = true;
		}
		if (this.transcript) {
			this.setupSingleTranscript(this.transcript);
			this.hasSlides = false;
		}

		this.flatPageStore = new NextThought.store.FlatPage();
		this.fireEvent('add-flatpage-store-context', this);

		this.callParent(arguments);

		this.cmpMap = {};

		if (!this.slideStore && !this.transcript) {
			this.hasNoPresentationParts = true;
		}
		this.fireEvent('uses-page-stores', this);

		this.fireEvent('listens-to-page-stores', this, {
			scope: this,
			add: 'onStoreEventsAdd',
			remove: 'onStoreEventsRemove'
		});

		Ext.EventManager.onWindowResize(function() {
			this.fireEvent('sync-height');
		}, this, {buffer: 250});

		this.on('resize', function() {
			this.fireEvent('sync-height');
		}, this);
	},


	beforeRender: function() {
		this.callParent(arguments);
		if (this.hasNoPresentationParts) {
			this.fireEvent('no-presentation-parts', this);
		}
	},


	bindStoreToComponents: function(store, cmps) {
		var r, sEl,
			m = this.noteOverlay.annotationManager,
			k = this.record, o, mc, me = this, win;

		this.cmpMap[store.containerId] = cmps;

		Ext.each(cmps, function(cmp) {
			this.fireEvent('register-records', store, store.getRange(), cmp);
			cmp.bindToStore(store);
			me.relayEvents(cmp, 'jump-video-to');
		});

		if (this.record) {
			// Since we've already added the record when its component registered its records,
			// let's just get its annotation object.
			o = m.findBy(function(item) {
				return item.record.getId() === k.getId();
			});
			if (!o) {
				console.warn('could not find annotation for record', k, ' in annotationManager: ', m);
				return;
			}

			r = o.range;
			if (r) {
				console.log('Need to scroll to range', r);
				sEl = this.el.getScrollingEl();
				if (sEl) {
					sEl.scrollTo('top', RangeUtils.safeBoundingBoxForRange(r).top - sEl.getY());
				}

				mc = new Ext.util.MixedCollection();
				mc.add(o);
				this.showAnnotations(mc, o.line);
				if (this.scrollToId) {

					// NOTE: If it's a reply, we're create the note viewer ourselves,
					// since we want to specify the scrollToId property.
					win = Ext.widget({
						autoShow: true,
						xtype: 'note-window',
						record: this.record,
						reader: this,
						scrollToId: this.scrollToId,
						xhooks: this.getViewerHooks()
					});

					me.fireEvent('register-note-window', this, win);
					delete this.record;
					return;
				}

				//Select record to open the note viewer.
				this.annotationView.getSelectionModel().select(o.record);
				delete this.record;
			}
		}
	},

	onStoreEventsAdd: function(store, records) {
		var cmps = this.cmpMap[store.containerId || ''];
		if (cmps) {
			Ext.each(cmps, function(c) {
				this.fireEvent('register-records', store, records, c);
			});
		}
	},


	onStoreEventsRemove: function(store, records) {
		var cmps = this.cmpMap[store.containerId || ''];
		if (cmps) {
			Ext.each(cmps, function(c) {
				this.fireEvent('unregister-records', store, records, c);
			});
		}
	},

	setupSingleTranscript: function(transcript) {
		var items = [];
		items.push({
			xtype: 'video-title-component',
			video: this.videoPlaylist[0]
		});
		items.push(
			{
				xtype: 'video-transcript',
				flex: 1,
				transcript: transcript,
				layout: {
					type: 'vbox',
					align: 'stretch'
				}
			});

		this.items = items;
	},


	buildPresentationTimeLine: function(slideStore, transcriptStore) {
		var items = [], lastVideoId;

		function itemWithId(list, id) {
			var item = null;

			if (Ext.isEmpty(list) || !id) {
				return null;
			}

			Ext.each(list, function(i) {
				if (i.get('NTIID') === id) {
					item = i;
				}
				return !item;
			});

			return item;
		}

		slideStore.each(function(slide) {
			var m = slide.get('media'),
				vid = m && m.getAssociatedVideoId(),
				t = transcriptStore.findRecord('associatedVideoId', vid, 0, false, true, true),
				start = slide.get('video-start'),
				end = slide.get('video-end'), videoObj, transcript;

			console.log('slide starts: ', start, ' slide ends: ', end, ' and has transcript for videoid: ', t && t.get('associatedVideoId'));

			if (!lastVideoId || lastVideoId !== vid) {
				lastVideoId = vid;
				videoObj = itemWithId(this.videoPlaylist, lastVideoId);
				if (videoObj) {
					items.push({
						xtype: 'video-title-component',
						video: videoObj
					});
				}
			}

			items.push({
				xtype: 'slide-component',
				slide: slide,
				layout: {
					type: 'vbox',
					align: 'stretch'
				}
			});

			if (t) {
				// NOTE: make a copy of the transcript record,
				// since many slide can have the same transcript but different start and end time.
				t = t.copy();
				t.set('desired-time-start', start);
				t.set('desired-time-end', end);

				items.push({
					xtype: 'video-transcript',
					flex: 1,
					transcript: t,
					layout: {
						type: 'vbox',
						align: 'stretch'
					}
				});
			}
		}, this);

		this.items = items;
	},


	getTranscriptForVideo: function(id, transcriptStore) {
		var s = transcriptStore.findRecord('associatedVideoId', id);
	},


	setupNoteOverlay: function() {
		var me = this;
		this.noteOverlay = Ext.widget('presentation-note-overlay', {reader: this, readerHeight: this.getHeight()});
		this.on('destroy', 'destroy', this.relayEvents(this.noteOverlay, ['editorActivated', 'editorDeactivated']));

		Ext.each(this.items.items, function(vt) {
			me.noteOverlay.registerReaderView(vt);
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.ownerCt.hasSlides = this.hasSlides;

		this.setupNoteOverlay();
		this.el.unselectable();
		this.addMask();
		//this.maybeLoadData();
		this.mon(this.el, {
			scope: this,
			'mousedown': 'mayBeHideAnnotationView'
		});

		this.mon(Ext.get(this.getScrollTarget()), 'scroll', 'onScroll');

		this.on('beforedestroy', 'beforeDestroy');

		this.on('will-hide-transcript', function() {
			if (this.annotationView) {
				this.annotationView.hide();
			}
		}, this);
	},


	getPartComponents: function() {
		return Ext.Array.filter(this.items.items, function(p) {
			return p !== undefined;
		});
	},


	getMaskTarget: function() {
		var root = this;
		while (root.ownerCt) {
			root = root.ownerCt;
		}

		return root.el;
	},


	addMask: function() {
		this.getMaskTarget().mask('Loading...');
		this.isMasked = true;
	},


	removeMask: function() {
		this.getMaskTarget().unmask();
		this.isMasked = false;
	},


	onAnimationEnd: function() {
		this.maybeLoadData();
	},


	maybeLoadData: function() {
		var partCmps = this.getPartComponents(),
			readyMap = {}, me = this;

		function maybeDone() {
			var done = true;
			Ext.Object.each(readyMap, function(k, v) {
				if (v === false) {
					done = false;
				}
				return done;
			});

			if (done) {
				me.ownerCt.slidesReady = true;

				if (me.hasSlides) {
					me.selectInitialSlide();
				}

				me.removeMask();

				me.fireEvent('presentation-parts-ready', me, me.getPartComponents(), me.startOn);
				me.fireEvent('load-presentation-userdata', me, me.getPartComponents());
			}
		}

		Ext.each(partCmps, function(p) {

			//Just in case something we aren't expecting sneaks in.
			if (p.isPresentationPartReady === undefined) {
				return;
			}

			if (!p.$presentationUUID) {
				p.$presentationUUID = guidGenerator();
			}
			readyMap[p.$presentationUUID] = p.isPresentationPartReady;
			if (p.isPresentationPartReady === false) {
				this.mon(p, 'presentation-part-ready', function(sender) {
					readyMap[sender.$presentationUUID] = true;
					maybeDone();
				});
			}
		}, this);
		maybeDone();
	},


	selectInitialSlide: function() {
		var startOn = this.startOn,
			s = this.query('slide-component'), me = this,
			targetImageEl;


		Ext.each(s, function(i) {
			var id = i.slide.get('NTIID'), img;
			if (id === startOn) {
				targetImageEl = i.el.down('img.slide');
			}
		});

		if (targetImageEl) {
			console.log('should scroll into view: ', targetImageEl.dom);
			Ext.defer(function() {
				targetImageEl.scrollIntoView(me.getTargetEl(), false, {listeners: {}});
			}, 10, me);
		}
	},


	highlightAtTime: function(seconds, allowScroll) {
		var cmps = this.query('video-transcript[transcript]') || [],
			cmp, tEl, shouldScroll, offset, bottom, me = this;
			scrollingEl = Ext.get(this.getScrollTarget());

		//if we are in the media view there is only one transcript
		if (this.up('media-viewer')) {
			cmp = cmps[0];
			offset = scrollingEl.getY();
		} else {
			offset = 10;
			cmps.every(function(c) {
				var t = c.transcript, current,
					start = t.get('desired-time-start'),
					end = t.get('desired-time-end');

				if (start <= seconds && end > seconds) {
					cmp = c;
					return;
				}

				return true;
			});
		}

		if (!cmp) {
			return;
		}

		tEl = cmp.getElementAtTime && cmp.getElementAtTime(seconds);

		if (tEl && this.currentTime !== seconds) {
			if (this.currentCue) {
				this.currentCue.removeCls('current');
			}

			tEl.addCls('current');
			this.currentCue = tEl;
			this.currentTime = seconds;

			if (allowScroll) {
				this.scrollToEl(tEl, offset);
			}
		}
	},


	scrollToEl: function(el, offset) {
		var scrollingEl = Ext.get(this.getScrollTarget()),
			top, bottom, shouldScroll;

		offset = offset || 0;

		bottom = el.dom && el.dom.getBoundingClientRect().bottom;

		//if its offscreen
		shouldScroll = bottom && (bottom > document.body.getBoundingClientRect().bottom || bottom < 0);

		if (shouldScroll && scrollingEl) {
			top = scrollingEl.getScrollTop() + (el.getY() - scrollingEl.getY()) - offset;
			this.desiredTop = top;
			scrollingEl.scrollTo('top', top);
		}
	},


	onScroll: function(e, dom) {
		//if the current scroll top is too far off were is should be the user initiated it.
		var delta = Math.abs(dom.scrollTop - this.desiredTop);

		if (delta > 10) {
			this.fireEvent('unsync-video');
		}
	},


	scrollToStartingTime: function(seconds) {
		var cmps = this.getPartComponents(), tEl, me = this, scrollingEl;

		// scroll the component that contains the given time into view.
		Ext.each(cmps, function(part) {
			if (part.isTimeWithinTimeRange && part.isTimeWithinTimeRange(seconds)) {
				tEl = part.getElementAtTime(seconds);
				scrollingEl = this.el.getScrollingEl();

				if (tEl && scrollingEl) {
					console.log('scrolling into view: ', tEl);
					scrollingEl.scrollTo('top', tEl.getBox().top - scrollingEl.getY());
					return false;
				}
			}
		});

		//return target element.
		return tEl;
	},


	selectSlide: function(slide) {
		if (!slide || !slide.isModel) {
			console.error('Unexpected argument, given', slide, 'expected a record');
			return;
		}
		var s = this.query('slide-component'),
			me = this,
			targetImageEl;

		Ext.each(s, function(i) {
			var id = i.slide.get('NTIID');

			if (id === slide.getId()) {
				targetImageEl = i.el.down('img.slide');
			}
		});

		if (!this.isMasked && targetImageEl) {
			Ext.defer(function() {
				me.scrollToEl(targetImageEl);
			}, 10, me);
		}
	},


	syncWithVideo: function(videoState, allowScroll) {
			if (videoState && videoState.time) {
				this.highlightAtTime(videoState.time, allowScroll);
			}
			//this.transcriptView.syncTranscriptWithVideo(videoState);
	},


	showAnnotations: function(annotations, line, store) {
		var s = store;

		if (!annotations || annotations.getCount() === 0) {
			return;
		}

		if (!s) {
			s = NextThought.store.FlatPage.create({
				storeId: 'presentation-annotations-' + line,
				filters: [{ id: 'nochildren', filterFn: function(r) { return !r.parent;}}]//override the base filter set
			});
			annotations.each(function(annotation) {
				//Note stores aren't unique here, but flatpage store won't let
				//us bind the same store to it twice.  How convenient..
				s.bind(annotation.store);
			});
		}

		if (line) {
			console.log('filtering by line: ', line);
			s.addFilter({
				id: this.lineFilterId,
				filterFn: function(r) {
					console.log('rec: ', r.getId(), ' line: ', r.get('line'));
					return r.get('pline') === line;
				}
			});
		}
		s.sort();

		this.showAnnotationView(s);
	},


	showAnnotationView: function(store) {
		var me = this, classList = 'presentation-note-slider annotation-view dark';
		if (!this.annotationView) {
			classList += (this.accountForScrollbars) ? ' scroll-margin-right' : '';
			if (Ext.is.iOS) {
				classList += ' scrollable';
			}
			this.annotationView = this.add({
				xtype: 'annotation-view',
				floating: true,
				border: false,
				width: 240,
				shadow: false,
				constrain: true,
				renderTo: Ext.getBody(),
				cls: classList,
				title: 'Discussion',
				iconCls: 'discus',
				discussion: true,
				store: 'ext-empty-store',
				anchorComponent: this,
				anchorComponentHooks: this.getViewerHooks(),
				floatParent: this,
				listeners: {
					itemremove: function() {
						if (this.getNodes().length === 0) {
							Ext.defer(this.hide, 1, this);
						}
					}
				}
			});

			this.annotationView.on('destroy', 'destroy',
					this.on({
						destroyable: true,
						scope: this.annotationView,
						resize: function() {
							if (this.isVisible()) {
								this.toFront();
							}
						}
					}));

			this.annotationView.show().hide();

			this.annotationView.on({
				scope: this,
				show: function() { me.fireEvent('will-show-annotation', me.annotationView, this); },
				hide: function() {
					if (me.el.down('.count.active')) {
						me.el.down('.count.active').removeCls('active');
					}
					me.fireEvent('will-hide-annotation', me.annotationView, this);
				}
			});
		}

		if (this.annotationView.store.storeId !== store.storeId) {
			// NOTE: Make sure we remove lineFilter before this is unbound.
			// otherwise, we end up in a funky state.
			this.annotationView.store.removeFilter(this.lineFilterId);
			this.annotationView.bindStore(store);
		}
		else {
			this.annotationView.refresh();
		}
		this.annotationView.show();
	},


	beforeDestroy: function() {
		return this.noteOverlay && this.noteOverlay.fireEvent('beforedestroy');
	},


	destroy: function() {
		if (this.annotationView && this.annotationView.store) {
			//Make sure we clear the line filter, since this store could be bound to another view.
			this.annotationView.store.removeFilter(this.lineFilterId);
			this.annotationView.destroy();
		}
		this.callParent(arguments);

	},


	mayBeHideAnnotationView: function(e) {
		if (!this.annotationView || !this.annotationView.isVisible()) {
			return true;
		}
		if ((!e || !e.getTarget('.annotation-view')) && this.annotationView.isVisible()) {
			this.annotationView.hide();
			this.noteOverlay.showAnnotationsAtLine(e);
			e.stopPropagation();
			return false;
		}
		return true;
	},


	getDomContextForRecord: function(r) {
		//Find the cmp with our UGD store.
		function fn(cmp) {
			var s = cmp.userDataStore;
			return s && s.findRecord('NTIID', r.get('NTIID'));
		}

		var cmps = Ext.Array.filter(this.items.items, fn), node = null;

		Ext.each(cmps, function(cmp) {

			if (Ext.isFunction(cmp.getDomContextForRecord) && (!Ext.isFunction(cmp.wantsRecord) || cmp.wantsRecord(r))) {
				node = cmp.getDomContextForRecord(r);
			}

			return !node;
		});

		return node;
	},

	//For compliance as a reader.
	getDocumentElement: Ext.emptyFn,
	getCleanContent: Ext.emptyFn,

	// NOTE: We don't need to scroll to a hit since when we open the media viewer we pass it the startMillis time,
	// By the time, this function gets called, we are already scrolled at the right location.
	scrollToHit: Ext.emptyFn,

	getScrollTarget: function() {
		return this.getTargetEl().dom || this.el.dom;
	},


	getViewerHooks: function() {
		return {
			'resizeView': function() {
				var reader = this.reader,
					w = reader.getWidth() - reader.annotationView.getWidth() - 20,
					h = reader.annotationView.getHeight(),
					pos = reader.annotationView.getPosition(),
					minWidth = 724;

				w = w > minWidth ? w : minWidth;
				pos[0] = (pos[0] - w > 0) ? (pos[0] - w) : 0;
				pos[0] += 10;
				pos[1] += 10;
				h -= 10;
				this.setPagePosition(pos);
				this.setWidth(w);
				this.setHeight(h);
			}
		};
	}

});
