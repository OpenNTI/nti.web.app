Ext.define('NextThought.view.content.reader.NoteOverlay', {

	requires: [
		'NextThought.util.Line',
		'NextThought.view.annotations.note.EditorActions',
		'NextThought.view.annotations.note.Templates',
		'NextThought.view.whiteboard.Window'
	],

	openWhiteboards: {},

	constructor: function(){
		var data = this.noteOverlayData;

		this.on({
			scope: this,
			'content-updated': function(){
				var r = this.getContentRoot();
				try {
					r = r.getBoundingClientRect();
				}
				catch(e) {
					r = {left:0,width:0};
				}
				data.left = r.left;
				data.width = r.width;
			},
			'afterRender': this.insertNoteOverlay
		});

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
	insertNoteOverlay: function(){
		var me = this,
			data = me.noteOverlayData,
			box, txt,
			container = {
			cls:'note-gutter',
			style: {
				height: me.getHeight()
			},
			cn: [{
				cls: 'note-here-control-box',
				cn: [{
					cls: 'entry',
					cn: [{
						cls: 'clear', html: '&nbsp;'
					},{
						cls: 'advanced', html: '&nbsp;', title: 'Advanced'
					},{
						tag: 'textarea',
						cls: 'note-input'
					},{
						cls: 'shadow-text',html: 'Write a note...'
					}]
				},{
					cls: 'bottom-border',
					html: '&nbsp;'
				},
					TemplatesForNotes.getEditorTpl()
				]
			}]
		};

		container = Ext.DomHelper.insertAfter(me.getInsertionPoint().first(),container,true);
		data.box = box = container.down('.note-here-control-box');
		data.textarea = txt = box.down('textarea');
		data.lineEntry = box.down('.entry');
		data.editor = box.down('.editor');
        data.main = box.down('.main');
        data.footer = box.down('.footer');

        //Firefox likes to allow you to edit the toolbar, fix that
        if (data.main){
            data.main.unselectable();
        }
        if (data.footer){
            data.footer.unselectable();
        }

		box.hide();

		(new Ext.CompositeElement( box.query('.action.save'))).on('click', me.noteOverlayEditorSave, me);
		(new Ext.CompositeElement( box.query('.entry .advanced'))).on('click', me.noteOverlayActivateRichEditor, me);
		(new Ext.CompositeElement( box.query('.cancel,.clear'))).on('click', me.noteOverlayEditorCancel, me);

		function onContentUpdate(){
            //when content is updated, we need to remove the editor because it will contain a bad range.
            this.noteOverlayDeactivateEditor();
        }

        function onResize(){}

		me.on({
			scope: me,
			destroy: function(){ container.remove(); },
			resize: onResize,
			'sync-height': function(h){ container.setHeight(h); },
			'content-updated': onContentUpdate
		});

		me.mon(data.editor.down('.content'),{
			scope: me,
			keypress: me.noteOverlayEditorKeyPressed,
			keydown: me.noteOverlayEditorKeyDown,
			keyup: me.noteOverlayEditorKeyUp
		});

		me.mon(txt,{
			scope: me,
			keypress: me.noteOverlayEditorKeyPressed,
			keydown: me.noteOverlayEditorKeyDown,
			keyup: me.noteOverlayEditorKeyUp,
			blur: me.noteOverlayDeactivedOnBlur
		});

		me.registerScrollHandler( function(e, dom){
			var me = this,
				t = data.box.dom.getBoundingClientRect().top;

			if( t < 0 || t > me.getHeight()){
				me.noteOverlayDeactivedOnBlur(e, dom);
			}

			data.editorActions.shareMenu.hide();
		}, me);

		me.mon(container,{
			scope: me,
			mousemove: me.noteOverlayMouseOver,
			mouseover: me.noteOverlayMouseOver,
			mouseout: me.noteOverlayMouseOut,
			//removed for mathcounts rollout to avoid apparent confusion. for now.
			//click: me.noteOverlayActivateEditor
			click: me.noteOverlayActivateRichEditor
		});

		data.editorActions = new NoteEditorActions(me, data.editor);
	},



	noteOverlayXYAllowed: function(x,y){
		var o = this.noteOverlayData, z = Math.round(y),
		r = o.restrictedRanges, v = z + this.getAnnotationOffsets().scrollTop;

		//test to see if line is occupied'
		return !(r && r[v]===true) && v > 120;
	},


	noteOverlayClearRestrictedRanges: function(){
		delete this.noteOverlayData.restrictedRanges;
	},


	noteOverlayAddRestrictedRange: function(rect){
		if(!rect){return;}

		var o = this.noteOverlayData,
			y = rect? Math.round(rect.bottom) + 10  :0,
			l = rect? Math.round(rect.top) - 10 : 0;
		o.restrictedRanges = o.restrictedRanges || [];
		for(y; y>=l && y>=0; y--){
			o.restrictedRanges[y] = true;
		}
	},


	noteOverlayRegisterAddNoteNib: function(applicableRange, nib, containerId){
		nib.on('click',this.noteOverlayAddNoteNibClicked,this, {applicableRange: applicableRange, containerId: containerId});
		//should keep track of this and cleanup if its detected to not be in the dom any more.
	},


	noteOverlayAddNoteNibClicked: function(e, dom, options){
		var o = this.noteOverlayData,
			w = e.getTarget('.widgetContainer',null,true),
			r = options.applicableRange,
			c = options.containerId;
		if(w){
			e.stopEvent();
//			w.hide();

			r = Anchors.toDomRange(r, this.getDocumentElement(), ReaderPanel.get().getCleanContent(), c);

			o.lastLine = {
				range: r,
				rect:r.getBoundingClientRect()
			};

			Ext.get(o.box).setY(0);

			//this.noteOverlayTrackLineAtEvent(e);
			this.noteOverlayPositionInputBox();
			this.noteOverlayActivateRichEditor();
			this.noteOverlayScrollEditorIntoView();
			return false;
		}
	},


	noteOverlayTrackLineAtEvent:function(e){
		var o = this.noteOverlayData,
			offsets = this.getAnnotationOffsets(),
			y = e.getY() - offsets.top, lineInfo,
			box = Ext.get(o.box);

		try {
			clearTimeout(o.mouseLeaveTimeout);
			lineInfo = LineUtils.findLine(y,this.getDocumentElement());

            if (e.type === 'click' && !lineInfo && o.lastLine && Math.abs(y - o.lastLine.rect.bottom) < 50){
                lineInfo = o.lastLine;
                delete o.lastLine;
            }


			if(lineInfo && (lineInfo !== o.lastLine || !o.lastLine)){
				o.lastLine = lineInfo;
				e.stopEvent();

				// We need to check if the new line doesn't overlap with a current lineInfo (which contains notes)
				if(!lineInfo.range || !this.noteOverlayXYAllowed.apply(this, [0, lineInfo.rect.top + offsets.top])){
					box.hide();
					this.noteOverlayMouseOut();
					return;
				}

				this.noteOverlayPositionInputBox();
				return true;
			}
		} catch(er){
			console.warn(Globals.getError(er));
		}
	},


	noteOverlayPositionInputBox: function(){
		var o = this.noteOverlayData,
			offsets = this.getAnnotationOffsets(),
			box = Ext.get(o.box),
			oldY = box.getY(),
			newY = 0;

		if (o.lastLine && o.lastLine.rect){
			newY = Math.round(o.lastLine.rect.top + offsets.top);
		}

		//check for minute scroll changes to prevent jitter:
		if(Math.abs(oldY - newY) > 4){
			box.setY(newY);
		}
		//show thew box:
		box.hide().show();
	},


	noteOverlayMouseOver: function(evt){
		var o = this.noteOverlayData, xy = evt.getXY().slice();

		if(o.suspendMoveEvents){
			return;
		}
		else if(!this.noteOverlayXYAllowed.apply(this,xy)){
			Ext.get(o.box).hide();
			return;
		}

		return this.noteOverlayTrackLineAtEvent(evt);
	},


	noteOverlayMouseOut: function(){
		var o = this.noteOverlayData,
			sel = this.getDocumentElement().parentWindow.getSelection();
		if(o.suspendMoveEvents){
			return;
		}
		if (sel) { sel.removeAllRanges(); }
		clearTimeout(o.mouseLeaveTimeout);
		o.mouseLeaveTimeout = setTimeout(function(){
			delete o.lastLine;
			o.box.hide();
		},100);
	},


	noteOverlayScrollEditorIntoView: function(){
		var o = this.noteOverlayData, e = o.textarea;
		if(!o.suspendMoveEvents){ return; }

		if(o.richEditorActive){
			e = o.editor;
		}

		e.scrollIntoView(this.body);
	},


	noteOverlayActivateRichEditor: function(evt){
		if(evt){
			evt.stopEvent();
			if(!this.noteOverlayMouseOver(evt)){
				return;
			}
		}

		var o = this.noteOverlayData,
			t = o.textarea.dom;

		o.suspendMoveEvents = true;
		if(o.richEditorActive){
			return;
		}

		o.richEditorActive = true;
		o.editorActions.updatePrefs();
		o.editorActions.activate();
		o.editorActions.setValue( t.value, true, true );
		t.value = '';


		if(!o.editor.isVisible()){
			this.noteOverlayDeactivateEditor();
			return;
		}

		this.noteOverlayScrollEditorIntoView();
	},


	noteOverlayActivateEditor: function(evt){
		evt.stopEvent();
		if(!this.noteOverlayMouseOver(evt)){
			return;
		}
		var o = this.noteOverlayData;
		if(o.suspendMoveEvents){
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


	noteOverlayDeactivateEditor: function(){
		var o = this.noteOverlayData;
		delete o.suspendMoveEvents;
		delete o.richEditorActive;
		o.textarea.dom.value = "";
		o.lineEntry.removeCls('active');
		o.editorActions.deactivate();
		o.editorActions.reset();
		this.noteOverlayMouseOut();
	},


	noteOverlayDeactivedOnBlur: function(e, el){
		e.stopEvent();
		var me  = this;
		if(!this.noteOverlayData.suspendMoveEvents){ return; }

		clearTimeout(me.blurTimer);
		me.blurTimer = setTimeout(function() {
			if(!me.noteOverlayData.richEditorActive){
				me.noteOverlayDeactivateEditor();
			}
		}, 150);
	},


	noteOverlayEditorCancel: function(e){
		e.stopEvent();
		this.noteOverlayDeactivateEditor();
		return false;
	},

	//This function is full of assumptions.  For now
	//we want to optimize notes on assessment questions by anchoring
	//them to the container and a null range.  We only want to do this
	//if they were created from the gutter since in theory eventually
	//we allow selecting text and highlighting/noteing on parts of the question.
	//Right now we identify created from the gutter by a style of surpressed, 
	//and we determine it is in an assessment if the ranges ancestor is or is contained in an
	//assessment object tag
	rangeForLastLineInfo: function(lastLine, style){
		var ancestor = lastLine.range.commonAncestorContainer ? Ext.fly(lastLine.range.commonAncestorContainer) : null,
		questionSelector = 'object[type="application/vnd.nextthought.naquestion"]',
		question, c;

		if(style !== 'suppressed'){
			return {range: lastLine.range, container: null};
		}

		
		//OK we are style suppressed
		question = ancestor.is(questionSelector) ? ancestor : ancestor.up(questionSelector);
		c = question ? question.getAttribute('data-ntiid') : null;
		if(question && c){
			return {range: null, container: c};
		}
		return {range: lastLine.range, container: null};
	},

	noteOverlayEditorSave: function(e){
		e.stopEvent();

		function callback(success, record){
			o.editor.unmask();
			if(success){
				me.noteOverlayDeactivateEditor();
			}
		}


		var me = this,
			p = (LocationProvider.getPreferences() || {}).sharing || {},
			o = me.noteOverlayData,
			note = o.textarea.dom.value,
			style = o.lastLine.style || 'suppressed',
			v, sharing = p.sharedWith || [], re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g,
			rangeInfo;

		if (o.richEditorActive){
			v = o.editorActions.getValue();
			note = v.body;
			sharing = v.shareWith;
		}

		//Avoid saving empty notes or just returns.
		if( !Ext.isArray(note) || note.join('').replace(re,'') === '' ){
			this.noteOverlayDeactivateEditor();
			return false;
		}

		o.editor.mask('Saving...');
        try {
			rangeInfo = this.rangeForLastLineInfo(o.lastLine, style);
		    me.fireEvent('save-new-note', note, rangeInfo.range, rangeInfo.container, sharing, style, callback);
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


	noteOverlayEditorKeyDown: function(event){
		var k = event.getKey();
		if(k === event.ESC){
			this.noteOverlayDeactivateEditor();
		}
		else if(k === event.ENTER && !this.noteOverlayData.richEditorActive){
			event.stopEvent();
			this.noteOverlayEditorSave(event);
		}
		return this.noteOverlayEditorKeyPressed(event);
	},


	noteOverlayEditorKeyPressed: function(event){
		event.stopPropagation();
		//control+enter & command+enter submit?

		//document.queryCommandState('bold')


		var o = this.noteOverlayData;
		delete o.editorActions.lastRange;
		if(o.richEditorActive){
			o.editor.repaint();
			this.noteOverlayScrollEditorIntoView();
		}
	},


	noteOverlayEditorKeyUp: function(){
		var o = this.noteOverlayData,
				t = o.textarea,
				h = t.dom.scrollHeight;

		//TODO: Use a better way to detect the note has gotten 'complex' and or too long for the line-box.
		if(h > t.getHeight()) {
			//transition to rich editor
			this.noteOverlayActivateRichEditor();
		}
	}
});
