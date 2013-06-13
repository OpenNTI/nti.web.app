Ext.define('NextThought.view.content.reader.NoteOverlay', {

	requires: [
		'NextThought.util.Line',
		'NextThought.view.annotations.note.Templates',
		'NextThought.view.whiteboard.Window',
		'NextThought.view.whiteboard.Utils',
		'NextThought.editor.Editor'
	],

	openWhiteboards: {},

	constructor: function () {
		var data = this.noteOverlayData;

		this.on({
			scope: this,
			'content-updated': function () {
				this.noteOverlayClearRestrictedRanges();
			},
			'afterRender': this.insertNoteOverlay,

			'markupenabled-action': this.contentDefinedAnnotationAction
		});


		//make sure we clear ranges when filter is changed
		FilterManager.registerFilterListener(this, this.noteOverlayClearRestrictedRanges, this);

		return this;
	},


	/**
	 * This property block serves as a namespace shell so that functions needed by this mixin do not clobber other
	 * mixin/subclass methods.
	 */
	noteOverlayData: {
		/** @private */
		visibilityCls: 'note-overlay-hidden'
	},


	/**
	 * This is invoked by an event in the context of the mixed in class... so this function exists in this helper
	 * object but it's "this" will be of the owner object.
	 * @private
	 */
	insertNoteOverlay: function () {
		var me = this,
			data = me.noteOverlayData,
			box, txt,
			container = {
				cls: 'note-gutter',
				style: {
					height: me.getHeight()
				},
				cn: [
					{
						cls: 'note-here-control-box',
						cn: [
							{
								cls: 'entry',
								cn: [
									{
										cls: 'clear', html: '&nbsp;'
									},
									{
										cls: 'advanced', html: '&nbsp;', 'data-qtip': 'Advanced'
									},
									{
										tag: 'textarea',
										cls: 'note-input'
									},
									{
										cls: 'shadow-text', html: 'Write a note...', unselectable: 'on'
									}
								]
							},
							{
								cls: 'bottom-border',
								html: '&nbsp;'
							},
							{ cls:'editorBox'}
						]
					}
				]
			};

		container = Ext.DomHelper.insertAfter(me.getInsertionPoint().first(), container, true);
		data.box = box = container.down('.note-here-control-box');
		data.textarea = txt = box.down('textarea');
		data.lineEntry = box.down('.entry');
		data.main = box.down('.main');
		data.footer = box.down('.footer');
		data.editorBox = box.down('.editorBox');
		box.down('.shadow-text').unselectable();

		//Firefox likes to allow you to edit the toolbar, fix that
		if (data.main) {
			data.main.unselectable();
		}
		if (data.footer) {
			data.footer.unselectable();
		}
		if(data.editorBox){
			data.editor = Ext.widget('nti-editor', {ownerCt: this, renderTo: data.editorBox, enableShareControls: true, enableTitle: true });
		}

		box.hide();

		(new Ext.CompositeElement(box.query('.action.save'))).on('click', me.noteOverlayEditorSave, me);
		(new Ext.CompositeElement(box.query('.entry .advanced'))).on('click', me.noteOverlayActivateRichEditor, me);
		(new Ext.CompositeElement(box.query('.cancel,.clear'))).on('click', me.noteOverlayEditorCancel, me);

		function onContentUpdate() {
			//when content is updated, we need to remove the editor because it will contain a bad range.
			this.noteOverlayDeactivateEditor();
		}

		function onResize() {
		}

		me.on({
			scope: me,
			destroy: function () {
				container.remove();
			},
			resize: onResize,
			'sync-height': function (h) {
				container.setHeight(h);
			},
			'content-updated': onContentUpdate
		});

		me.mon(data.editor.el.down('.content'), {
			scope: me,
			keypress: me.noteOverlayEditorKeyPressed,
			keydown: me.noteOverlayEditorKeyDown,
			keyup: me.noteOverlayEditorKeyUp
		});

		me.mon(txt, {
			scope: me,
			keypress: me.noteOverlayEditorKeyPressed,
			keydown: me.noteOverlayEditorKeyDown,
			keyup: me.noteOverlayEditorKeyUp,
			blur: me.noteOverlayDeactivedOnBlur
		});

		me.registerScrollHandler(function (e, dom) {
			var me = this,
				t = data.box.dom.getBoundingClientRect().top;

			if (t < 0 || t > me.getHeight()) {
				me.noteOverlayDeactivedOnBlur(e, dom);
			}
		}, me);

		me.mon(container, {
			scope: me,
			mousemove: me.noteOverlayMouseOver,
			mouseover: me.noteOverlayMouseOver,
			mouseout: me.noteOverlayMouseOut,
			//removed for mathcounts rollout to avoid apparent confusion. for now.
			//click: me.noteOverlayActivateEditor
			click: me.noteOverlayActivateRichEditor
		});

		data.editor.on('cancel','noteOverlayEditorCancel',me);
	},


	noteOverlayXYAllowed: function (x, y) {
		var o = this.noteOverlayData, z = Math.round(y),
			r = o.restrictedRanges, v = z + this.getAnnotationOffsets().scrollTop;

		//test to see if line is occupied'
		return !(r && r[v] === true) && v > 120;
	},


	noteOverlayClearRestrictedRanges: function () {
		delete this.noteOverlayData.restrictedRanges;
	},


	noteOverlayAddRestrictedRange: function (rect) {
		if (!rect) {
			return;
		}

		var o = this.noteOverlayData,
			y = rect ? Math.round(rect.bottom) + 10 : 0,
			l = rect ? Math.round(rect.top) - 10 : 0;
		o.restrictedRanges = o.restrictedRanges || [];
		for (y; y >= l && y >= 0; y--) {
			o.restrictedRanges[y] = true;
		}
	},


	contentDefinedAnnotationAction: function (dom, action) {
		var o = this.noteOverlayData,
			d = Ext.fly(dom).up('[itemprop~=nti-data-markupenabled]').down('[id]:not([id^=ext])'),
			id = d ? d.id : null,
			img = d && d.is('img') ? d.dom : null,
			doc = dom ? dom.ownerDocument : null,
			range, offsets;

		if (/mark/i.test(action)) {
			range = doc.createRange();
			range.selectNode(img);
			offsets = this.getAnnotationOffsets();
			o.lastLine = this.lineInfoForRangeAndRect(range, img.getBoundingClientRect(), offsets);

			this.noteOverlayPositionInputBox();
			this.noteOverlayActivateRichEditor();
			WBUtils.createFromImage(img, function (data) {
				o.editor.reset();
				o.editor.setValue('');
				o.editor.addWhiteboard(data);
				o.editor.focus(true);
			});
		}
	},


	noteOverlayRegisterAddNoteNib: function (applicableRange, nib, containerId) {
		nib.on('click', this.noteOverlayAddNoteNibClicked, this, {applicableRange: applicableRange, containerId: containerId});
		//should keep track of this and cleanup if its detected to not be in the dom any more.
	},


	noteOverlayAddNoteNibClicked: function (e, dom, options) {
		var o = this.noteOverlayData,
			w = e.getTarget('.widgetContainer', null, true),
			r = options.applicableRange,
			c = options.containerId,
			rect;
			//offsets;
		if (w) {
			e.stopEvent();
//			w.hide();
			
			r = Anchors.toDomRange(r, this.getDocumentElement(), ReaderPanel.get().getCleanContent(), c);
			//offsets = this.getAnnotationOffsets();
			if(w.dom){
				rect = w.dom.getBoundingClientRect();
				//The line is aligned at the bottom of the nib so fake it out here
				rect.top = rect.bottom;

			}
			//Note we don't pass offsets here
			o.lastLine = this.lineInfoForRangeAndRect(r, rect);

			Ext.get(o.box).setY(0);

			//this.noteOverlayTrackLineAtEvent(e);
			this.noteOverlayPositionInputBox();
			this.noteOverlayActivateRichEditor();
			this.noteOverlayScrollEditorIntoView();
			return false;
		}
	},


	copyClientRect: function (rect) {
		var mutatedRect = {
			top: rect.top,
			bottom: rect.bottom,
			height: rect.height,
			left: rect.left,
			right: rect.right,
			width: rect.width
		};

		return mutatedRect;
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
		var overlay = this.overlayedPanelAtY(y),
			result = null, offsets, mutatedRect;
		//If there is an overlay at that position it gets
		//the decision as to if there is a line there.  After
		if (overlay) {
			if (overlay.findLine) {
				//TODO normalize y into overlay space and send it along
				result = overlay.findLine();
			}
			return result;
		}
		result = LineUtils.findLine(y, this.getDocumentElement());

		//Ok this was from the iframe so we need to adjust it slightly
		if (result && result.rect) {
			offsets = this.getAnnotationOffsets();
			mutatedRect = this.adjustContentRectForTop(result.rect, offsets.top);
			result.rect = mutatedRect;
		}
		return result;
	},


	openNoteEditorForRange: function (range, rect, style) {
		var offsets = this.getAnnotationOffsets(),
			lastLine = this.lineInfoForRangeAndRect(range, rect, offsets);

		lastLine.style = style;

		Ext.apply(this.noteOverlayData, {
			lastLine: lastLine,
			suspendMoveEvents: true
		});

		this.noteOverlayPositionInputBox();
		this.noteOverlayActivateRichEditor();
		this.noteOverlayScrollEditorIntoView();
	},


	noteOverlayTrackLineAtEvent: function (e) {
		var o = this.noteOverlayData,
			offsets = this.getAnnotationOffsets(),
			y = e.getY() - offsets.top, lineInfo,
			box = Ext.get(o.box);

		try {
			clearTimeout(o.mouseLeaveTimeout);
			lineInfo = this.lineInfoForY(y);

			if (e.type === 'click' && !lineInfo && o.lastLine && Math.abs(y - o.lastLine.rect.bottom) < 50) {
				lineInfo = o.lastLine;
				delete o.lastLine;
			}


			if (lineInfo && (lineInfo !== o.lastLine || !o.lastLine)) {
				o.lastLine = lineInfo;
				e.stopEvent();

				// We need to check if the new line doesn't overlap with a current lineInfo (which contains notes)
				if (!lineInfo.range || !this.noteOverlayXYAllowed.apply(this, [0, lineInfo.rect.top])) {
					box.hide();
					this.noteOverlayMouseOut();
					return;
				}

				this.noteOverlayPositionInputBox();
				return true;
			}
		} catch (er) {
			console.warn(Globals.getError(er));
		}
	},


	noteOverlayPositionInputBox: function () {
		var o = this.noteOverlayData,
			box = Ext.get(o.box),
			oldY = box.getY(),
			newY = 0;

		if (o.lastLine && o.lastLine.rect) {
			newY = Math.round(o.lastLine.rect.top);
		}

		//if(newY < 110){ newY = 110; }

		//check for minute scroll changes to prevent jitter:
		if (Math.abs(oldY - newY) > 4) {
			box.setY(newY);
		}
		//show thew box:
		box.hide().show();
	},


	noteOverlayMouseOver: function (evt) {
		var o = this.noteOverlayData, xy = evt.getXY().slice();

		if (o.suspendMoveEvents) {
			return;
		}

		if (!this.noteOverlayXYAllowed.apply(this, xy)) {
			Ext.get(o.box).hide();
			return;
		}

		return this.noteOverlayTrackLineAtEvent(evt);
	},


	noteOverlayMouseOut: function () {
		var o = this.noteOverlayData,
			sel = this.getDocumentElement().parentWindow.getSelection();
		if (o.suspendMoveEvents) {
			return;
		}
		if (sel) {
			sel.removeAllRanges();
		}
		clearTimeout(o.mouseLeaveTimeout);
		o.mouseLeaveTimeout = setTimeout(function () {
			delete o.lastLine;
			o.box.hide();
		}, 100);
	},


	noteOverlayScrollEditorIntoView: function () {
		var o = this.noteOverlayData, e = o.textarea;
		if (!o.suspendMoveEvents) {
			return;
		}

		if (o.richEditorActive) {
			e = o.editor.el;
		}

		e.scrollIntoView(this.body);
	},


	noteOverlayActivateRichEditor: function (evt) {
		if (evt) {
			evt.stopEvent();
			if (!this.noteOverlayMouseOver(evt)) {
				return;
			}
		}

		var o = this.noteOverlayData,
			t = o.textarea.dom;

		o.suspendMoveEvents = true;
		if (o.richEditorActive) {
			return;
		}

		o.richEditorActive = true;
		o.editor.updatePrefs();
		o.editor.activate();
		o.editor.setValue(t.value, true, true);
		t.value = '';
		setTimeout(function () {
			o.editor.focus();
		}, 250);


		if (!o.editor.isVisible()) {
			this.noteOverlayDeactivateEditor();
			return;
		}

		this.noteOverlayScrollEditorIntoView();
	},


	noteOverlayActivateEditor: function (evt) {
		evt.stopEvent();
		if (!this.noteOverlayMouseOver(evt)) {
			return;
		}
		var o = this.noteOverlayData;
		if (o.suspendMoveEvents) {
			return;
		}
		if (!o.lastLine || !o.lastLine.range || o.lastLine.range.collapsed) {
			return;
		}

		o.suspendMoveEvents = true;
		o.lineEntry.addCls('active');
		o.textarea.focus().dom.value = "";
		this.noteOverlayScrollEditorIntoView();
		return false;//stop the click in IE
	},


	noteOverlayDeactivateEditor: function () {
		var o = this.noteOverlayData;
		delete o.suspendMoveEvents;
		delete o.richEditorActive;
		o.textarea.dom.value = "";
		o.lineEntry.removeCls('active');
		o.editor.deactivate();
		o.editor.reset();
		o.editor.clearError();
		this.noteOverlayMouseOut();
	},


	noteOverlayDeactivedOnBlur: function (e, el) {
		e.stopEvent();
		var me = this;
		if (!this.noteOverlayData.suspendMoveEvents) {
			return;
		}

		clearTimeout(me.blurTimer);
		me.blurTimer = setTimeout(function () {
			if (!me.noteOverlayData.richEditorActive) {
				me.noteOverlayDeactivateEditor();
			}
		}, 150);
	},


	noteOverlayEditorCancel: function (e) {
		if(e){e.stopEvent();}
		this.noteOverlayDeactivateEditor();
		return false;
	},


	rangeForLastLineInfo: function (lastLine, style) {
		var ancestor = lastLine.range.commonAncestorContainer ? Ext.fly(lastLine.range.commonAncestorContainer) : null,
			containerSelector = 'object[data-nti-container]',
			container, c;

		if (style !== 'suppressed') {
			return {range: lastLine.range, container: null};
		}

		//OK we are style suppressed
		container = ancestor.is(containerSelector) ? ancestor : ancestor.up(containerSelector);
		c = container ? container.getAttribute('data-ntiid') : null;
		if (container && c) {
			return {range: null, container: c};
		}
		return {range: lastLine.range, container: null};
	},


	noteOverlayEditorSave: function (e) {
		e.stopEvent();
		if(e.getTarget('.disabled')){ return; }

		function callback(success, record) {
			o.editor.unmask();
			if (success) {
				me.noteOverlayDeactivateEditor();
			}
		}


		var me = this,
			p = (LocationProvider.getPreferences() || {}).sharing || {},
			o = me.noteOverlayData,
			note = o.textarea.dom.value,
			style = o.lastLine.style || 'suppressed',
			v, sharing = p.sharedWith || [], re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g,
			rangeInfo,
			title = '';

		if (o.richEditorActive) {
			v = o.editor.getValue();
			note = v.body;
			title = v.title;
			sharing = SharingUtils.sharedWithForSharingInfo(v.sharingInfo);
		}

		//Avoid saving empty notes or just returns.
		if (!Ext.isArray(note) || note.join('').replace(re, '') === '') {
			console.warn("Note's body is required");
			this.markError(o.editor.el.down('.content'), 'Please enter text below');
			return false;
		}

		o.editor.mask('Saving...');
		try {
			rangeInfo = this.rangeForLastLineInfo(o.lastLine, style);
			me.fireEvent('save-new-note', title, note, rangeInfo.range, rangeInfo.container || LocationProvider.currentNTIID, sharing, style, callback);
		}
		catch (error) {
			console.error('Error saving note - ' + Globals.getError(error));
			alert('There was an error saving your note.');
			o.editor.unmask();
			//lets not remove, at least give user change to recover their text
			//me.noteOverlayDeactivateEditor();
		}
		return false;
	},


	markError: function(el,message){ el.addCls('error-tip').set({'data-error-tip':message}); },


	noteOverlayEditorKeyDown: function (event) {
		var k = event.getKey();
		if (k === event.ESC) {
			this.noteOverlayDeactivateEditor();
		}
		else if (k === event.ENTER && !this.noteOverlayData.richEditorActive) {
			event.stopEvent();
			this.noteOverlayEditorSave(event);
		}
		return this.noteOverlayEditorKeyPressed(event);
	},


	noteOverlayEditorKeyPressed: function (event) {
		event.stopPropagation();
		//control+enter & command+enter submit?

		//document.queryCommandState('bold')


		var o = this.noteOverlayData;
		delete o.editor.lastRange;
		if (o.richEditorActive) {
			//o.editor.repaint();
			this.noteOverlayScrollEditorIntoView();
		}
	},


	noteOverlayEditorKeyUp: function () {
		var o = this.noteOverlayData,
			t = o.textarea,
			h = t.dom.scrollHeight;

		//TODO: Use a better way to detect the note has gotten 'complex' and or too long for the line-box.
		if (h > t.getHeight()) {
			//transition to rich editor
			this.noteOverlayActivateRichEditor();
		}
	}
});
