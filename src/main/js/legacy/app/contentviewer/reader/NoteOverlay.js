const Ext = require('extjs');

const DomUtils = require('legacy/util/Dom');
const Globals = require('legacy/util/Globals');
const LineUtils = require('legacy/util/Line');
const {getString} = require('legacy/util/Localization');
const SharingUtils = require('legacy/util/Sharing');

const WBUtils = require('../../whiteboard/Utils');
const UserdataActions = require('../../userdata/Actions');

require('legacy/util/Line');
require('legacy/editor/Editor');


module.exports = exports = Ext.define('NextThought.app.contentviewer.reader.NoteOverlay', {
	alias: 'reader.noteOverlay',

	mixins: {
		observable: 'Ext.util.Observable'
	},

	disable: function () {
		this.disabled = true;
		if (!this.container) {return;}

		this.container.hide();
	},

	constructor: function (config) {
		Ext.apply(this, config);
		this.mixins.observable.constructor.call(this);
		this.mon(this.reader, {
			scope: this,
			destroy: 'destroy',
			afterRender: 'insertOverlay',
			'scroll':	'onScroll',
			'content-updated': 'onContentUpdate',
			'markupenabled-action': 'contentDefinedAnnotationAction',
			'sync-height': 'syncHeight',
			'create-note': 'noteHereEvent',
			'beforenavigate': 'onNavigation',
			'beforedeactivate': 'onNavigation'
		});


		this.data = {
			/** @private */
			visibilityCls: 'note-overlay-hidden'
		};

		this.reader.fireEvent('uses-page-preferences', this);

		this.UserDataActions = UserdataActions.create();
	},

	insertOverlay: function () {
		var me = this,
			box,
			container = {
				cls: 'note-gutter', onclick: 'void(0)',
				style: {
					height: me.reader.getIframe().get().getHeight()
				},
				cn: [
					{ cls: 'note-here-control-box', onclick: 'void(0)' }
				]
			};

		me.container = container = Ext.DomHelper.insertAfter(me.reader.getInsertionPoint().first(), container, true);

		box = me.data.box = container.down('.note-here-control-box');
		box.visibilityCls = this.data.visibilityCls;
		box.setVisibilityMode(Ext.Element.ASCLASS);
		box.hide();

		if (Ext.is.iPad) {
			me.mon(box, {
				click: 'openEditorClick',
				mouseover: 'overNib'
			});
		}
		else {
			me.mon(box, {
				click: 'openEditorClick',
				mouseover: 'overNib',
				mousemove: 'overNib',
				mouseout: 'offNib',
				scope: me
			});
		}

		if (Ext.is.iPad) {
			me.reader.on('destroy', 'destroy',
				me.mon(container.parent(), {
					scope: me,
					destroyable: true,
					click: 'trackLineAtEvent'
				}));
		}
		else {
			me.reader.on('destroy', 'destroy',
				me.mon(container.parent(), {
					scope: me,
					destroyable: true,
					mousemove: 'mouseOver',
					mouseover: 'mouseOver',
					mouseout: 'mouseOut'
				}));

			me.reader.on({
				//no buffer
				'iframe-mouseout': 'mouseOut',
				'iframe-mousedown': 'suspendResolver',
				'iframe-mouseup': 'resumeResolver',
				scope: me
			});

			me.reader.on({
				scope: me,
				'iframe-mousemove': 'mouseOver',
				buffer: 400
			});
		}

		if (this.disabled) {
			this.disable();
		}
	},

	getAnnotationOffsets: function () {
		return this.reader.getAnnotationOffsets();
	},

	onNavigation: function () {
		if (this.editor && this.editor.isActive()) {
			var msg = getString('NextThought.view.content.reader.NoteOverlay.editing');
			Ext.defer(function () {
				alert({msg: msg});
			}, 1);

			return false;
		}

		return true;
	},

	onScroll: function (e, dom) {
	},

	onContentUpdate: function () {
	},

	editorCleanup: function () {
		delete this.suspendMoveEvents;
		delete this.editor;
	},

	getTabPanel: function () {
		var targetEl = this.reader.getEl().up('.x-container-reader.reader-container'),
			tabPanel;

		tabPanel = targetEl.down('.x-panel-notes-and-discussion');
		return tabPanel && Ext.getCmp(tabPanel.id);
	},

	allowOpenEditor: function () {
		if (this.editor && !this.editor.isDestroyed) {
			return false;
		}

		return true;
	},

	openEditorClick: function (e, rect) {
		var nib = e && e.getTarget('.note-here-control-box'),
			top;

		rect = (nib && nib.getBoundingClientRect()) || rect;

		top = rect && rect.top;

		if (this.allowOpenEditor() && this.getTabPanel()) {
			this.openEditor(top || 80);
			return true;
		}

		return false;
	},

	openEditor: function (top) {
		if (this.disabled) { return Promise.reject(); }

		var me = this,
			location = me.reader.getLocation(),
			pageId = location.NTIID,
			readerRect = me.reader.getAnnotationOffsets().rect, left,
			currentBundle = location.currentBundle,
			targetEl = this.reader.getEl().up('.x-container-reader.reader-container'),
			tabPanel = me.getTabPanel(),
			viewWidth = Ext.Element.getViewportWidth(),
			editorWidth,
			lineInfo = me.data.box.activeLineInfo;

		if (!me.allowOpenEditor() || !tabPanel) {
			return Promise.reject();
		}

		function work (prefs) {
			var sharing = prefs && prefs.sharing,
				sharedWith = sharing && sharing.sharedWith,
				shareInfo = SharingUtils.sharedWithToSharedInfo(SharingUtils.resolveValue(sharedWith), currentBundle);


			me.mouseOut();
			me.suspendMoveEvents = true;


			tabPanel.mask();

			me.editor = Ext.widget('nti-editor', {
				lineInfo: lineInfo || {},
				ownerCmp: me.reader,
				sharingValue: shareInfo,
				floating: true,
				renderTo: targetEl,
				enableShareControls: true,
				enableFileUpload: true,
				enableTitle: true,
				preventBringToFront: true,
				listeners: {
					'deactivated-editor': 'destroy',
					'no-title-content': function () {return !Globals.isFeature('notepad');},//require title if notepad is a feature
					grew: function () {
						if (Ext.is.iPad) {
							return;
						}

						var height = this.getHeight(),
							y = parseInt(this.el.getStyle('top'), 10),
							bottom = height + y,
							viewHeight = Ext.Element.getViewportHeight();

						if (bottom > viewHeight) {
							this.el.setStyle({
								top: (viewHeight - height) + 'px'
							});
						} else if (y < 70) {
							this.el.setStyle({
								top: '70px'
							});
						}
					}
				}
			}).addCls('active in-gutter');
			me.editor.toFront();

			//20 px left of the right side of the reader
			left = readerRect.right - 20;

			editorWidth = me.editor.getWidth();

			//make sure this left won't put the editor off screen
			if (left + editorWidth >= viewWidth - 20) {
				left = viewWidth - 20 - editorWidth;
			}

			//TODO: Figure out how to align this with the window scrolling
			me.editor.el.setStyle({
				top: top + 'px',
				left: left + 'px'
			});

			me.editor.on({
				save: 'saveNewNote',
				destroy: 'editorCleanup',
				scope: me
			});

			me.editor.focus();

			me.editor.on('destroy', 'unmask', tabPanel);
			me.editor.mon(tabPanel, 'resize', 'syncEditorWidth', me);


			if (Ext.is.iPad) {
				Ext.defer(function () {
					var contentEl = me.editor.el.down('.content'),
						footerHeight = me.editor.el.down('.footer').getHeight(),
						hiddenAmount = window.innerHeight - 276,
						contentHeight = contentEl.getY() - (window.outerHeight - window.innerHeight),
						toSetHeight = window.innerHeight - contentHeight - footerHeight - hiddenAmount;
					contentEl.setStyle('max-height', toSetHeight + 'px');
				}, 1000);
			}

			me.syncEditorWidth(tabPanel, tabPanel.getWidth());
		}

		return this.UserDataActions.getPreferences(pageId, currentBundle)
			.then(work.bind(this))
			.catch(function () { return null; });
	},

	syncEditorWidth: function (c, w) {
		var edEl = this.editor.getEl(),
			minW,
			nW = w + 65;
		if (!edEl) {
			return;
		}

		minW = parseInt(edEl.getStyle('min-width'), 10) || nW;//if edEl reads NaN, default it
		this.editor.setWidth(minW > nW ? minW : nW);
		this.editor.fireEvent('grew');
	},

	syncHeight: function (h) {
		var c = this.container;
		if (c) {
			c.setHeight(h);
		}
	},

	saveNewNote: function (editor, r, v) {
		var me = this,
			note = v.body,
			title = v.title,
			location = this.reader.getLocation(),
			pageInfo = location.pageInfo,
			bundle = location.currentBundle,
			pageId = pageInfo.getId(),
			style = editor.lineInfo.style || 'suppressed',
			rangeInfo;

		function afterSave (success) {
			editor.unmask();
			if (success) {
				editor.deactivate();
			}
		}

		//Avoid saving empty notes or just returns.
		if (DomUtils.isEmpty(note)) {
			me.editor.markError(me.editor.el.down('.content'), getString('NextThought.view.content.reader.NoteOverlay.empty'));
			return false;
		}

		editor.el.mask(getString('NextThought.view.content.reader.NoteOverlay.saving'));

		rangeInfo = me.rangeForLineInfo(editor.lineInfo, style);
		me.UserDataActions.saveNewNote(
			title, note, rangeInfo.range, rangeInfo.container || pageId,
			SharingUtils.sharedWithForSharingInfo(v.sharingInfo, bundle),
			style, afterSave
		).then(function () {
			editor.unmask();
			editor.deactivate();
		}).catch(function (e) {
			console.error(Globals.getError(e));
			editor.unmask();
		});

		return false;
	},

	noteHereEvent: function (range, rect, style, top) {
		this.data.box.activeLineInfo = Ext.apply(
			{style: style},
			this.lineInfoForRangeAndRect(range, rect));

		var readerRect = this.reader.getAnnotationOffsets().rect;

		return this.openEditorClick(null, {
			top: rect.top + readerRect.top
		});
	},

	noteHere: function (range, rect, style, top) {
		this.positionInputBox(Ext.apply(this.lineInfoForRangeAndRect(range, rect), {style: style}));

		return this.openEditor(top)
			.catch(function () {
				alert(getString('NextThought.view.content.reader.NoteOverlay.inprogress'));
				return Promise.reject();
			});
	},

	contentDefinedAnnotationAction: function (dom, action) {
		var d = Ext.fly(dom).up('[itemprop~=nti-data-markupenabled]').down('[id]:not([id^=ext])'),
			me = this,
			img = d && d.is('img') ? d.dom : null,
			doc = dom ? dom.ownerDocument : null,
			readerRect = this.reader.getAnnotationOffsets().rect,
			range, rect, top;

		if (/mark/i.test(action)) {
			range = doc.createRange();
			range.selectNode(img);
			rect = img.getBoundingClientRect();

			top = rect ? rect.top + readerRect.top : 0;

			this.noteHere(range, rect, null, top)
				.then(function () {
					WBUtils.createFromImage(img, function (data) {
						me.editor.reset();
						me.editor.setValue('');
						me.editor.addWhiteboard(data);
						me.editor.focus(true);
					});
				});
		}
	},

	getAnnotationGutter: function () {
		if (!this.annotationGutter) {
			this.annotationGutter = this.reader.el.down('.annotation-gutter');
		}

		return this.annotationGutter;
	},

	//	isOccupied: function(y){
	//		var g = this.getAnnotationGutter(),
	//			r = g && g.select('[data-line]'),
	//			o = false;
	//
	//		if(r){
	//			r.each(function(e){
	//				var i = parseInt(e.getAttribute('data-line'),10);
	//				o = i===y || Math.abs(i-y) < 5;
	//				return !o;
	//			});
	//		}
	//
	//		return o;
	//	},


	copyClientRect: function (rect) {
		return {
			top: rect.top,
			bottom: rect.bottom,
			height: rect.height,
			left: rect.left,
			right: rect.right,
			width: rect.width
		};
	},

	adjustContentRectForTop: function (rect, top) {
		var adjusted = this.copyClientRect(rect);
		adjusted.top += top;
		adjusted.bottom += top;
		return adjusted;
	},

	lineInfoForRangeAndRect: function (range, rect, offsets) {
		return {range: range, rect: offsets ? this.adjustContentRectForTop(rect, offsets.top) : rect};
	},

	lineInfoForY: function (y) {
		var overlay = this.reader.getComponentOverlay().overlayedPanelAtY(y),
			result = null,
			top;

		//If there is an overlay at that position it gets
		//the decision as to if there is a line there.	After
		if (overlay) {
			if (overlay.findLine) {
				//TODO normalize y into overlay space and send it along
				result = overlay.findLine(y);

				//Ok this was from the iframe so we need to adjust it slightly
				if (result && result.rect) {
					//use the negative of the top to adjust y coordinates for this overlayed panel. (its coordinate
					// space the same as the gutter's so all our conversions need to be undone.)
					top = -this.getAnnotationOffsets().rect.top;
					result.rect = this.adjustContentRectForTop(result.rect, top);
				}
			}
			return result;
		}
		result = LineUtils.findLine(y, this.reader.getDocumentElement());

		//Ok this was from the iframe so we need to adjust it slightly
		if (result && result.rect) {
			result.rect = this.copyClientRect(result.rect);
		}
		return result;
	},

	trackLineAtEvent: function (e) {
		var o = this.data,
			offsets = this.getAnnotationOffsets(),
			y = e.getY() - offsets.top, lineInfo,
			box = Ext.get(o.box);

		try {
			clearTimeout(this.mouseLeaveTimeout);
			lineInfo = this.lineInfoForY(y);

			if (e.type === 'click' && !lineInfo && o.lastLine && Math.abs(y - o.lastLine.rect.bottom) < 50) {
				lineInfo = o.lastLine;
				delete o.lastLine;
			}


			if (lineInfo && (lineInfo !== o.lastLine || !o.lastLine)) {
				o.lastLine = lineInfo;

				// don't stop events when mousing over videos, or else the
				// mouse events on videos won't be invoked
				if(e.target && !e.target.matches('.video-controls-overlay')) {
					e.stopEvent();
				}

				if (!lineInfo.range) {
					box.hide();
					this.mouseOut();
					return false;
				}
				this.positionInputBox(lineInfo);
				return true;
			}
		} catch (er) {
			console.warn(Globals.getError(er));
		}
		return false;
	},

	positionInputBox: function (lineInfo) {
		var o = this.data,
			offset = this.getAnnotationOffsets(),
			box = Ext.get(o.box),
			oldY = box.getY() - offset.top,
			newY = 0,
			// occ,
			//activeY = oldY,
			line = lineInfo || o.lastLine;

		if (line && line.rect) {
			newY = Math.round(line.rect.top);
		}

		//check for minute scroll changes to prevent jitter:
		if (oldY < 0 || Math.abs(oldY - newY) > 4) {
			box.setStyle({top: newY + 'px'});
			//activeY = newY;
		}

		//occ = this.isOccupied(activeY);
		//box[occ? 'addCls':'removeCls']('occupied');
		//show the box:

		box.activeLineInfo = line;
		box.show();
	},

	offNib: function (e) {
		if (!Ext.is.iPad) {
			e.stopEvent();
		}
		this.mouseOut(e);
	},

	overNib: function (e) {
		if (!Ext.is.iPad) {
			e.stopEvent();
		}
		clearTimeout(this.mouseLeaveTimeout);
		return false;
	},

	suspendResolver: function () {
		this.suspendMoveEvents = true;
	},

	resumeResolver: function () {
		delete this.suspendMoveEvents;
	},

	mouseOver: function (evt) {
		if (Ext.dd.DragDropManager.dragCurrent || this.suspendMoveEvents || this.reader.creatingAnnotation) {
			return false;
		}

		return this.trackLineAtEvent(evt);
	},

	mouseOut: function (e) {

		if (this.suspendMoveEvents || this.reader.creatingAnnotation) {
			return;
		}

		var o = this.data,
			sel = this.reader.getDocumentElement().parentWindow.getSelection();
		if (sel) {
			sel.removeAllRanges();
		}

		clearTimeout(this.mouseLeaveTimeout);
		this.mouseLeaveTimeout = setTimeout(function () {
			delete o.lastLine;
			delete o.box.activeLineInfo;
			o.box.hide();
		}, 100);
	},

	rangeForLineInfo: function (line, style) {
		var range = line.range,
			maybeContainer = (range && range.commonAncestorContainer) || null,
			containerSelector = 'object[data-nti-container]',
			container, c;

		if (style !== 'suppressed') {
			return {range: line.range, container: null};
		}

		//If we are a single non text node we will check to see if that node is the
		//container rather than the common ancestor.
		if (range && (range.startContainer === range.endContainer && range.startContainer.nodeType !== Node.TEXT_NODE && range.startOffset + 1 === range.endOffset)) {
			maybeContainer = range.startContainer.childNodes[range.startOffset];
		}

		//OK we are style suppressed
		maybeContainer = maybeContainer && Ext.fly(maybeContainer);
		container = !maybeContainer || maybeContainer.is(containerSelector) ? maybeContainer : maybeContainer.up(containerSelector);
		c = container ? container.getAttribute('data-ntiid') : null;
		if (container && c) {
			return {range: null, container: c};
		}
		return {range: line.range, container: null};
	},

	//TODO: fill this out
	allowNavigation: function () {
		if (!this.editor || !this.editor.isActive()) {
			return Promise.resolve();
		}

		var me = this;

		return new Promise(function (fulfill, reject) {
			Ext.Msg.show({
				title: 'Attention!',
				msg: 'You are currently creating a note. Would you like to leave without saving?',
				buttons: {
					primary: {
						text: 'Leave',
						cls: 'caution',
						handler: function () {
							me.editor.destroy();
							fulfill();
						}
					},
					secondary: {
						text: 'Stay',
						handler: reject
					}
				}
			});
		});
	}
});
