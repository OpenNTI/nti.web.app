Ext.define('NextThought.view.slidedeck.transcript.NoteOverlay', {
	alias:'widget.presentation-note-overlay',

	requires:[
		'NextThought.util.Line',
		'NextThought.view.whiteboard.Utils',
		'NextThought.editor.Editor'
	],
	mixins: {
		'observable': 'Ext.util.Observable'
	},

	annotationManager: new Ext.util.MixedCollection(),

	controlTpl: new Ext.XTemplate( Ext.DomHelper.markup([
		{tag:'span', cls:'count', 'data-line':'{line}', 'data-count':'{count}', html:'{count}'}
	])),

	constructor: function(config){
		Ext.apply(this, config);
		this.mixins.observable.constructor.call(this);

		var me = this;

		this.insertOverlay();
		if(!me.noteOverlayManager){
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
			'show-editor-inline':'showEditorAtPosition',
			'register-records': 'registerGutterRecords'
		});

		this.mon(this.annotationManager, {
			'add': 'onAnnotationAdded'
		});

		this.data = {};

		this.editor = Ext.widget('nti-editor', {
			ownerCt: this.reader,
			floating: true,
			renderTo: Ext.getBody(),
			enableShareControls: true,
			enableTitle: true,
			listeners:{
				'deactivated-editor': function(){ me.reader.suspendMoveEvents = false; },
				'activated-editor': function(){ me.reader.suspendMoveEvents = true; },
				grew: function(){
					var h = this.getHeight(),
						b = h + this.getY(),
						v = Ext.Element.getViewportHeight();
					if(b>v){
						this.setY(v-h);
					}
				}
			}
		}).addCls('in-gutter');

		me.editorEl = me.editor.el;

		me.mon(me.editorEl.down('.save'),{ scope: me, click: me.editorSaved });
		me.editorEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

		me.reader.relayEvents(me,['save-new-note', 'save-new-series-note']);
	},




	registerReaderView: function(view){
		this.noteOverlayManager.push(view);
		this.mon(view, {
			scope: this,
			destroy: 'destroy',
			'create-note': 'noteHere',
			'sync-height': 'syncHeight',
			'show-editor': 'showEditorByEl',
			'show-editor-inline':'showEditorAtPosition'
		});
	},


	insertOverlay: function(){
		this.annotationOverlay = Ext.DomHelper.insertAfter(this.reader.getTargetEl().first(), {cls: 'note-gutter'}, true);
	},


	editorSaved: function(e){
		if(e) { e.stopEvent(); }

		function callback(success, record){
			me.editorEl.unmask();
			if(success){
				me.deactivateEditor();
			}
		}

		function onError(error){
			console.error('Error saving note - ' + (error ? Globals.getError(error) : ''));
			alert('There was an error saving your note.');
			me.editorEl.unmask();
		}

		var me = this,
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g,
			style = 'suppressed',
			v = me.editor.getValue(),
			note = v.body,
			title = v.title,
			sharing = [],
			range = me.data.range,
			container = me.data.containerId;

		if(v.sharingInfo){
			sharing = SharingUtils.sharedWithForSharingInfo(v.sharingInfo);
		}

		//Avoid saving empty notes or just returns.
		if( !Ext.isArray(note) || note.join('').replace(re,'') === '' ){
			me.editor.markError(me.editor.el.down('.content'), 'Please enter text before you save');
			return false;
		}

		me.editorEl.mask('Saving...');
		try {
			// NOTE: For slide notes, for now we're keeping them domRange notes.
			if(me.data.isDomRange){
				me.fireEvent('save-new-note', title, note, range, container, sharing, style, callback);
			}
			else{
				me.fireEvent('save-new-series-note', title, note, range, me.data, container, sharing, style, callback);
			}
		}
		catch (error) {
			onError(error);
		}
		return false;
	},


	noteHere: function(){
		console.log('To Be Implemented');
	},


	syncHeight: function(){
		console.warn('Sync-height to be implemented');
	},


	getFrameHeight: function(){
		return this.readerHeight+'px';
	},


	activateEditor: function(info){
		if(this.editor){
			this.data = info; //Ext.apply(this.data || {}, cueInfo);
			this.editor.reset();
			this.editor.activate();
		}
	},

	deactivateEditor: function(){
		this.editor.deactivate();
	},


	showEditorByEl: function(cueInfo, el){
		this.activateEditor(cueInfo);
		this.editor.alignTo( el,'tl-tr?');
		this.editor.show();
	},


	showEditorAtPosition: function(cueInfo, xy){
		this.activateEditor(cueInfo);
		this.editor.showAt(xy);
	},


	registerGutterRecords: function(noteStore, view){
		if(Ext.isEmpty(noteStore)){ return;}

		var me = this,
			notes = noteStore.getRange();

		Ext.each(notes, function(n){
			me.registerNoteRecord(n, view, noteStore);
		});
	},


	registerNoteRecord: function(rec, cmp, recStore){
		var anchorResolver =  cmp && cmp.getAnchorResolver && cmp.getAnchorResolver(),
			cueStore = cmp.getCueStore && cmp.getCueStore(),
			domRange, rect, line, domFrag, b;

		if(!anchorResolver){ anchorResolver = NextThought.view.slidedeck.transcript.AnchorResolver; }

		if(cmp.slide){
			domFrag = cmp.slide.get('dom-clone');

			// NOTE: In order to be able to resolve a line in the presentation we need a dom range.
			// the range we get from the dom range will be with reference to the raw content,
			// since we're taking a portion of the content and slide are nothing but the image,
			// we will create a dom range off the img element that we have in this cmp.
			b = anchorResolver.doesContentRangeDescriptionResolve(rec.get('applicableRange'), domFrag);
			if(b){
				domRange = cmp.createDomRange();
			}
		}
		else{
			domRange = anchorResolver.fromTimeRangeToDomRange(rec.get('applicableRange'), cueStore, cmp.el);
		}
		console.log('domrange for record: ', rec, domRange);

		if(Ext.isEmpty(domRange)){
			console.warn('Could not resolve dom range anchor for record: ', rec);
			return;
		}

		rect = domRange.getBoundingClientRect();
		line = rect ? Math.round(rect.top): 0;
		rec.set('line', line);

		this.annotationManager.add({
			id:rec.getId(),
			rect: rect,
			range: domRange,
			record: rec,
			store: recStore,
			line: line
		});
	},


	onAnnotationAdded: function(i, o){
		var count = this.getAnnotationsAtLine(o.line).getCount(),
			tpl = this.controlTpl,
			line = o.line,
			el;

		console.log('adding note at: ', line);
		el = this.annotationOverlay.down('.count[data-line='+line+']');
		if(!el){
			el = tpl.append(this.annotationOverlay, {line:line, count:count}, true);
			this.mon(el, 'click', 'showAnnotationsAtLine', this);
		} else{
			el.update(count);
		}
		el.setStyle('top', line+'px');
	},


	showAnnotationsAtLine: function(e){
		var t = e.getTarget('.count', null, true),
			line = t.getAttribute('data-line'), annotations;

		if(!line){ return;}
		line = parseInt(line);
		annotations = this.getAnnotationsAtLine(line);
		this.reader.showAnnotations(annotations, line);
	},


	getAnnotationsAtLine: function(line){
		return this.annotationManager.filterBy(function(item){
			return item.line === line;
		});
	}
});