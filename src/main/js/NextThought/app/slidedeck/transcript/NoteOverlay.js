Ext.define('NextThought.app.slidedeck.transcript.NoteOverlay', {
	alias: 'widget.presentation-note-overlay',//THIS IS NOT A COMPONENT!! IT SHOULD NOT HAVE AN ALIAS, MUCH LESS A **WIDGET.** PREFIX!

	requires: [
		'NextThought.util.Line',
		'NextThought.app.whiteboard.Utils',
		'NextThought.editor.Editor'
	],
	mixins: {
		'observable': 'Ext.util.Observable'
	},

	annotationManager: new Ext.util.MixedCollection(),

	controlTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'span', cls: 'count', 'data-line': '{line}', 'data-count': '{count}', html: '{count}'}
	])),

	constructor: function(config) {
		Ext.apply(this, config);
		this.mixins.observable.constructor.call(this);

		var me = this;

//		this.adjustAnnotationOverlayPosition = Ext.Function.createBuffered(this.adjustAnnotationOverlayPosition, 10);
		this.syncHeight = Ext.Function.createBuffered(this.syncHeight, 10);

		this.insertOverlay();
		if (!me.noteOverlayManager) {
			//TODO: we will something more robust to manage different reader views that get added.
			// But for now, use just an array.
			me.noteOverlayManager = [];
		}
		this.mon(this.reader, {
			scope: this,
			destroy: 'destroy',
			'create-note': 'noteHere',
			'sync-height': 'syncHeight',
			'show-editor': 'showEditorByEl',
			'show-editor-inline': 'showEditorAtPosition',
			'register-records': 'registerGutterRecords',
			'unregister-records': 'unRegisterGutterRecords',
			'presentation-parts-ready': 'adjustAnnotationOverlayPosition'
		});

		this.mon(this.reader, {
			scope: this,
			'sync-height': 'adjustAnnotationOverlayPosition'
		});

		this.mon(this.annotationManager, {
			'add': 'onAnnotationAdded',
			'remove': 'onAnnotationRemoved',
			scope: this
		});

		this.data = {};

		this.editor = Ext.widget('nti-editor', {
			ownerCt: this.reader,
			floating: true,
			renderTo: Ext.getBody(),
			enableShareControls: true,
			enableTitle: true,
			width: 325,//match the content note window's width...a bit hackish, but this will get it from growing wider for now.
			listeners: {
				'deactivated-editor': function() {
					me.fireEvent('editorDeactivated');
					me.reader.suspendMoveEvents = false;
				},
				'activated-editor': function() {
					me.fireEvent('editorActivated');
					me.reader.suspendMoveEvents = true;
				},
				'no-title-content': function() {return !isFeature('notepad');},//require title if notepad is a feature
				grew: function() {
					var h = this.getHeight(),
							b = h + this.getY(),
							v = Ext.Element.getViewportHeight();
					if (b > v) {
						this.setY(v - h);
					}
				}
			}
		}).addCls('in-gutter');

		me.editorEl = me.editor.el;
		me.editor.setWidth(325);
		me.mon(me.editor, 'save', 'editorSaved', me);
		me.mon(me.editorEl.down('.cancel'), { scope: me, click: me.editorCanceled });
		me.editorEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

		me.reader.relayEvents(me, ['save-new-note', 'save-new-series-note']);
		me.reader.fireEvent('uses-page-preferences', this);

		me.on('beforedestroy', 'beforeDestroy');
        me.on('beforedeactivate', 'beforeDeactivate');
	},




	registerReaderView: function(view) {
		this.noteOverlayManager.push(view);
		this.mon(view, {
			scope: this,
			destroy: 'destroy',
			'create-note': 'noteHere',
			'sync-height': 'syncHeight',
			'show-editor': 'showEditorByEl',
			'show-editor-inline': 'showEditorAtPosition'
		});
	},

	beforeDestroy: function() {
		if (this.editor && this.editor.isActive()) {
			var msg = 'You are currently creating a note. Please save or cancel it first.';
			Ext.defer(function() {
				alert({msg: msg});
			}, 1);

			return false;
		}

		return true;
	},


    beforeDeactivate: function(){
        if (this.editor && this.editor.isActive()) {
            var msg = 'You are currently creating a note. Please save or cancel it first.';
            Ext.defer(function() {
                alert({msg: msg});
            }, 1);

            return false;
        }

        return this.reader && this.reader.fireEvent('beforedeactivate');
    },


	destroy: function() {
		this.callParent(arguments);
		if (this.annotationManager.length > 0) {
			this.annotationManager.removeAll();
		}
	},


	insertOverlay: function() {
		this.annotationOverlay = Ext.DomHelper.insertAfter(this.reader.getTargetEl().first(), {cls: 'note-gutter'}, true);

		this.mon(this.annotationOverlay, 'click', 'showAnnotationsAtLine', this);
	},


	adjustAnnotationOverlayPosition: function() {
		if (!this.reader.rendered || !this.annotationOverlay) { return; }

		var cmps = Ext.isFunction(this.reader.getPartComponents) ? this.reader.getPartComponents() : [],
			w = this.reader.getWidth(),
			maxWidth = 860,
			me = this;

		if (w === 0) {
			Ext.defer(this.adjustAnnotationOverlayPosition, 10, this);//hidden, let the repaint finish
			return;
		}

		w = w < maxWidth ? w - 75 : maxWidth - 75;
		this.annotationOverlay.setStyle('left', w + 'px');

//		Ext.each(cmps, function(cmp) {
//			if (Ext.isFunction(cmp.positionAnnotationNibs)) {
//				cmp.positionAnnotationNibs(me.reader.el);
//			}
//		});

		this.realignNotes();
	},


	realignNotes: function() {
		this.annotationManager.removeAll();

		//This is  not the right way to be plumbing this.  I'm not sure I have any better ideas though,
		//the overlay needs component specific data to render a note.
		var cmps = Ext.isFunction(this.reader.getPartComponents) ? this.reader.getPartComponents() : [];
		Ext.each(cmps || [], function(cmp) {
			if (Ext.isFunction(cmp.registerAnnotations)) {
				cmp.registerAnnotations();
			}
		});
	},


	editorSaved: function(editor, r, v) {

		function callback(success, record) {
			me.editorEl.unmask();
			if (success) {
				me.deactivateEditor();
			}
		}

		function onError(error) {
			console.error('Error saving note - ' + (error ? Globals.getError(error) : ''));
			alert('There was an error saving your note.');
			me.editorEl.unmask();
		}

		var me = this,
			style = 'suppressed',
			note = v.body,
			title = v.title,
			sharing = [],
			range = me.data.range,
			container = me.data.containerId;

		if (v.sharingInfo) {
			sharing = SharingUtils.sharedWithForSharingInfo(v.sharingInfo);
		}

		//Avoid saving empty notes or just returns.
		if (DomUtils.isEmpty(note)) {
			me.editor.markError(me.editor.el.down('.content'), 'Please enter text before you save');
			return false;
		}

		me.editorEl.mask('Saving...');
		try {
			// NOTE: For slide notes, for now we're keeping them domRange notes.
			if (me.data.isDomRange) {
				me.fireEvent('save-new-note', title, note, range, container, sharing, style, callback);
			}
			else {
				me.fireEvent('save-new-series-note', title, note, range, me.data, container, sharing, style, callback);
			}
		}
		catch (error) {
			onError(error);
		}
		return false;
	},

	editorCanceled: function() {
		if (this.editor.closeCallback) {
			Ext.callback(this.editor.closeCallback);
		}
	},


	noteHere: function() {
		console.log('To Be Implemented');
	},


	syncHeight: function() {
		var cmps,
				r = this.reader,
				el = r && r.el;

		if (el && el.isVisible(true)) {
			Ext.defer(this.syncHeight, 10, this);
			return;
		}

		this.realignNotes();
	},


	getFrameHeight: function() {
		return this.readerHeight + 'px';
	},


	activateEditor: function(info, cb) {
		if (this.editor) {
			this.data = info; //Ext.apply(this.data || {}, cueInfo);
			this.editor.reset();

			if (Ext.isFunction(cb)) {
				this.editor.closeCallback = cb;
			}

			this.setDefaultSharingFor((info || {}).containerId);
			this.editor.activate();
		}
	},

	deactivateEditor: function() {
		if (this.editor.closeCallback) {
			Ext.callback(this.editor.closeCallback);
			delete this.editor.closeCallback;
		}
		this.editor.deactivate();
	},


	showEditorByEl: function(cueInfo, el, cb) {
		this.activateEditor(cueInfo, cb);
		this.editor.alignTo(el, 'tl-tr?');
		this.editor.show();
		this.editor.toFront();
		this.editor.focus();
	},


	showEditorAtPosition: function(cueInfo, xy) {
		this.activateEditor(cueInfo);
		this.editor.showAt(xy);
	},


	setDefaultSharingFor: function(ntiid) {
		var me = this;
		//me.editor.disable();//curious...
		this.resolveRootPageInfoFor(ntiid).then(function(meta) {
			var pageInfo = meta && meta.pageInfo, pageId,
				p = Promise.resolve();

			function recover() {return null;}

			if (pageInfo) {
				pageId = pageInfo.getId();
				p = Promise.all([
					me.getPagePreferences(pageId).fail(recover),
					Ext.getCmp('content').currentBundle
				])
					.then(function(data) {
						var prefs = data[0],
							sharing = prefs && prefs.sharing,
							sharedWith = sharing && sharing.sharedWith;

						return SharingUtils.sharedWithToSharedInfo(SharingUtils.resolveValue(sharedWith), data[1]);
				});
			}

			return p.then(function(shareInfo) {
				me.editor.setSharedWith(shareInfo);
				me.reader.pageInfo = pageInfo;
				//me.editor.enable();
			});
		});
	},


	registerGutterRecords: function(noteStore, records, view) {
		if (Ext.isEmpty(noteStore)) { return;}

		var me = this,
			reader = me.reader;
		//TODO: This function should be buffered, but doing so would cause
		// the previous calls to be dropped.
		if (!reader.el || !reader.el.isVisible(true)) {
			Ext.defer(this.registerGutterRecords, 10, this, arguments);
			return;
		}


		Ext.each(records, function(n) {
			if (n.isTopLevel && n.isTopLevel()) {
				me.registerNoteRecord(n, view, noteStore);
			}
		});
	},


	rangeForDescription: function(rec, cmp, recStore) {
		var anchorResolver = cmp && cmp.getAnchorResolver && cmp.getAnchorResolver(),
			cueStore = cmp.getCueStore && cmp.getCueStore(),
			domRange, rect, line, domFrag, b, d;

		//Why are we doing this?
		rec = recStore.getById(rec.getId()) || rec;

		if (!rec) {
			return null;
		}

		if (Ext.isFunction(cmp.domRangeForRecord) && (!Ext.isFunction(cmp.wantsRecord) || cmp.wantsRecord(rec))) {
			domRange = cmp.domRangeForRecord(rec);
		}

		return domRange;
	},


	registerNoteRecord: function(rec, cmp, recStore) {

		if (this.isRecordAlreadyAdded(rec)) {return;}

		var domRange = this.rangeForDescription(rec, cmp, recStore),
				rect, line, readerTop;

		if (Ext.isEmpty(domRange)) {
			return;
		}

		rect = RangeUtils.safeBoundingBoxForRange(domRange);

		//Get the scroll target.
		readerTop = this.reader.el.getTop();
		line = rect ? rect.top - readerTop : 0;
		rec.set('pline', line);

		this.annotationManager.add({
			id: rec.getId(),
			rect: rect,
			range: domRange,
			record: rec,
			store: recStore,
			line: line
		});
	},


	unRegisterGutterRecords: function(store, records, view) {
		var me = this;
		Ext.each(records, function(rec) {
			me.unRegisterNoteRecord(rec);
		});
	},


	unRegisterNoteRecord: function(rec) {
		var r = this.annotationManager.findBy(function(item) { return item.id === rec.getId();});
		if (r) {
			this.annotationManager.remove(r);
		}
	},


	isRecordAlreadyAdded: function(rec) {
		var b = this.annotationManager.filterBy(function(item) {
			return item.id === rec.getId();
		});

		return b.getCount() > 0;
	},


	updateAnnotationCountAtLine: function(line, count) {
        var tpl = this.controlTpl,
			el = this.getAnnotationEl(line);

        if(el){
            Ext.fly(el).update(count);
            return;
        }

        // Only create new element is count is greater than zero.
        if (Ext.isEmpty(el) && count > 0) {
            el = tpl.append(this.annotationOverlay, {line: line, count: count}, true);
            el.setStyle('top', line + 'px');
        }
    },

	getAnnotationEl: function(line) {
		var annotations = this.annotationOverlay.query('.count[data-line]'),
			result = this.annotationOverlay.down('.count[data-line=' + line + ']');

		if (result || Ext.isEmpty(annotations)) { return result; }

		Ext.each(annotations, function(item) {
			var nLine = item.getAttribute('data-line');

			if (nLine && Math.abs(nLine - line) < 2) {
				result = item;
			}
		});

		return result;
	},


	onAnnotationAdded: function(i, o) {
		var count = this.getAnnotationsAtLine(o.line).getCount();
		if (count > 0) {
			this.updateAnnotationCountAtLine(o.line, count);
		}
	},


	onAnnotationRemoved: function(o) {
		var count = this.getAnnotationsAtLine(o.line).getCount();
        this.updateAnnotationCountAtLine(o.line, count);
	},


	showAnnotationsAtLine: function(e) {
		var t = e && e.getTarget('.count', null, true),
			line = t && t.getAttribute('data-line'), annotations;

		if (!line) { return;}
		t.addCls('active');
		line = parseInt(line, 10);
		annotations = this.getAnnotationsAtLine(line);
		this.reader.showAnnotations(annotations, line);
	},


	getAnnotationsAtLine: function(line) {
		var fudgeFactor = 2;
		return this.annotationManager.filterBy(function(item) {
			var rec = item.record,
					s = item.store.getById(rec.getId());
			if (s && (s.get('pline') !== rec.get('pline'))) {
				s.set('pline', rec.get('pline'));
			}
			return Math.abs(item.line - line) < fudgeFactor;
		});
	},


	resolveRootPageInfoFor: function(ntiid) {
		var rootId = ContentUtils.getLineage(ntiid);

		rootId = rootId && rootId.last();
		if (!rootId) {
			return Promise.reject('No ID');
		}
		return LocationMeta.getMeta(rootId);
	}
});
