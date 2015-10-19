Ext.define('NextThought.app.mediaviewer.components.reader.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-transcript',
	requires: [
		'NextThought.layout.component.Natural',
		'NextThought.util.Store',
		'NextThought.app.contentviewer.reader.NoteOverlay',
		'NextThought.app.mediaviewer.components.reader.NoteOverlay',
		'NextThought.app.mediaviewer.components.reader.parts.Transcript',
		'NextThought.app.mediaviewer.components.reader.parts.Slide',
		'NextThought.app.mediaviewer.components.reader.parts.VideoTitle',
		'NextThought.app.mediaviewer.components.reader.parts.NoTranscript',
		'NextThought.app.mediaviewer.Actions',
		'NextThought.app.mediaviewer.StateStore',
		'NextThought.app.annotations.renderer.Manager',
		'NextThought.app.annotations.Index',
		'NextThought.app.userdata.Actions',
		'NextThought.app.windows.Actions'
	],

	ui: 'transcript',
	cls: 'transcript-view scrollable',
	items: [],

	layout: 'none',

	desiredTop: 0,

	lineFilterId: 'plinefilter',

	bubbleEvents: ['add', 'remove', 'editor-open', 'editorActivated', 'editorDeactivated'],

	mixins: {
		Searchable: 'NextThought.mixins.Searchable'
	},

	initComponent: function() {
		this.enableBubble(['presentation-parts-ready', 'no-presentation-parts', 'jump-video-to']);

		this.buildComponents();
		this.UserDataActions = NextThought.app.userdata.Actions.create();
		this.MediaViewerActions = NextThought.app.mediaviewer.Actions.create();
		this.MediaViewerStore = NextThought.app.mediaviewer.StateStore.getInstance();
		this.WindowActions = NextThought.app.windows.Actions.create();

		this.flatPageStore = new NextThought.store.FlatPage();
		this.UserDataActions.initPageStores(this);

		this.callParent(arguments);

		if (!this.resourceList && !this.transcript) {
			this.hasNoPresentationParts = true;
		}

		this.initSearch();

		//Store Events
		this.UserDataActions.setupPageStoreDelegates(this);

		this.UserDataActions.listenToPageStores(this, {
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


	getContainerIdForSearch: function() {
		return this.video.getId();
	},


	onceReadyForSearch: function() {
		var transcript = this.down('video-transcript');

		return new Promise(function(fulfill, reject) {
			if (!transcript) {
				fulfill();
			} else if (transcript.isPresentationPartReady) {
				fulfill();
			} else {
				transcript.on('presentation-part-ready', fulfill);
			}
		});
	},


	buildComponents: function() {
		var items = [];
		if (this.transcript) {
			items = [{
				xtype: 'video-title-component',
				video: this.videoPlaylist[0]
			}, {
				xtype: 'video-transcript',
				transcript: this.transcript
			}];
		}
		else {
			if (this.resourceList) {
				items = this.resourceList;
			}
			else {
				items.push({
					xtype: 'no-video-transcript',
					video: this.videoPlaylist[0]
				});

				this.hasNoPresentationParts = true;
			}
		}

		this.items = items;
	},


	beforeRender: function() {
		this.callParent(arguments);
		if (this.hasNoPresentationParts) {
			this.fireEvent('no-presentation-parts', this);
		}
	},


	onStoreEventsAdd: function(store, records) {
		var cmps = this.MediaViewerStore.getComponentsForStore(store.containerId);
		Ext.each(cmps, function(c) {
			if (c.isVisible(true)) {
				this.fireEvent('register-records', store, records, c);
			}
		});
	},


	onStoreEventsRemove: function(store, records) {
		var cmps = this.MediaViewerStore.getComponentsForStore(store.containerId);
		Ext.each(cmps, function(c) {
			if (c.isVisible(true)) {
				this.fireEvent('unregister-records', store, records, c);
			}
		});
	},


	setupNoteOverlay: function() {
		var me = this;

		this.noteOverlay = Ext.create('NextThought.app.mediaviewer.components.reader.NoteOverlay', {
			reader: this,
			readerHeight: this.getHeight()
		});

		this.on('destroy', 'destroy', this.relayEvents(this.noteOverlay, ['editorActivated', 'editorDeactivated']));

		Ext.each(this.items.items, function(vt) {
			me.noteOverlay.registerReaderView(vt);
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.setupNoteOverlay();
		this.el.unselectable();
		this.addMask();
		this.mon(this.el, {
			scope: this,
			'mousedown': 'mayBeHideAnnotationView'
		});

		if (!this.transcript && !this.resourceList) {
			this.el.addCls('no-transcript-view');
		}

		this.mon(Ext.get(this.getScrollTarget()), 'scroll', 'onScroll');

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

				Promise.all(me.MediaViewerActions.loadUserData(partCmps, me))
					.then(function() {
						wait(10).then(me.fireEvent.bind(me, 'sync-height'));
					})
					.fail(function() {
						console.error('*****FAILED to load UserData in the Media Viewer: ', arguments);
					});
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
			if (!p.isPresentationPartReady) {
				this.mon(p, 'presentation-part-ready', function(sender) {
					readyMap[sender.$presentationUUID] = true;
					maybeDone();
				});
			}
		}, this);
		maybeDone();
	},


	highlightAtTime: function(seconds, allowScroll) {
		var cmps = this.getPartComponents(),
			me = this,
			offset = 10;

		if (this.currentTime === seconds || Ext.isEmpty(cmps)) {
			return;
		}

		// highlight and scroll the component that contains the given time into view.
		Ext.each(cmps, function(cmp) {
			var isTimePart = cmp.isTimeWithinTimeRange && cmp.isTimeWithinTimeRange(seconds), tEl;
			if (isTimePart) {
				tEl = cmp.getElementAtTime && cmp.getElementAtTime(seconds);

				if (tEl) {
					if (me.currentCue) {
						me.currentCue.removeCls('current');
					}

					// Checking the time make sure we only scroll the first part,
					// when we have parts that are overlapping.
					// NOTE: For now, if we have overlapping parts scroll to the last one. We use to scroll to the first one. 
					if (allowScroll) {
						me.scrollToEl(tEl, offset);
					}

					tEl.addCls('current');
					me.currentCue = tEl;
					me.currentTime = seconds;
				}
			}
		});
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
		var cmps = this.getPartComponents(), tEl, scrollingEl;

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
				filters: [{ id: 'nochildren', filterFn: function(r) { return !r.parent; }}]//override the base filter set
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
					//console.log('rec: ', r.getId(), ' line: ', r.get('line'));
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
				showNote: this.showNote.bind(this),
				listeners: {
					itemremove: function() {
						if (this.store && this.store.count() === 0) {
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
			this.on('destroy', 'destroy', this.annotationView);

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
		// this.getLayout().setActiveItem(this.annotationView);
	},


	destroy: function() {
		if (this.annotationView && this.annotationView.store) {
			//Make sure we clear the line filter, since this store could be bound to another view.
			this.annotationView.store.removeFilter(this.lineFilterId);
		}

		if (this.annotationView) {
			this.annotationView.destroy();
		}

		this.callParent(arguments);

	},

	beforeDeactivate: function() {
		if (this.annotationView && this.annotationView.isVisible()) {
			this.annotationView.hide();
		}
	},

	allowNavigation: function() {
		if (this.noteOverlay && this.noteOverlay.editor.isActive()) {
			return this.noteOverlay.allowNavigation();
		} else {
			return Promise.resolve();
		}
	},


	mayBeHideAnnotationView: function(e) {
		if (!this.annotationView || !this.annotationView.isVisible()) {
			return true;
		}
		if ((!e || !e.getTarget('.annotation-view')) && this.annotationView.isVisible()) {
			this.annotationView.hide();
			this.noteOverlay.showAnnotationsAtLine(e);
			if (e) {
				e.stopPropagation();
			}
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
	scrollToHit: function() {},

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
	},

	showNote: function(record, el, monitors) {
		this.WindowActions.pushWindow(record, null, el, monitors);
	}

});
