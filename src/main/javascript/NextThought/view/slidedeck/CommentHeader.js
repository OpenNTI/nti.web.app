Ext.define('NextThought.view.slidedeck.CommentHeader',{
	extend: 'Ext.Component',
	alias: 'widget.slide-comment-header',

	ui: 'slide',
	cls: 'comment-header',

	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.view.annotations.note.EditorActions',
		'NextThought.view.annotations.note.Templates'
	],


	renderSelectors: {
		editor: '.editor',
		comment: '.comment',
		count: '.comment .count span'
	},


	initComponent: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData||{},{
			count: this.count || 0
		});
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		me.comment.setVisibilityMode(Ext.dom.Element.DISPLAY);
		me.mon(me.comment,'click',me.activateEditor,me);
		me.editorActions = new NoteEditorActions(me,me.editor);

		me.mon(me.editor.down('.cancel'),{ scope: me, click: me.deactivateEditor });
		me.mon(me.editor.down('.save'),{ scope: me, click: me.editorSaved });

		me.mon(me.editor.down('.content'),{
			scope: me,
			keypress: me.editorKeyPressed,
			keydown: me.editorKeyDown
		});

		console.log(this.count.getHTML());
		if(parseInt(this.count.getHTML(),10) > 0){
			this.comment.addCls('has-count');
		}
	},


	getRoot: function(){
		var r = this.rootCache || this.up('slidedeck-slide');
		if(!this.rootCache){ this.rootCache = r; }
		return r;
	},


	activateEditor: function(){
		if(this.getRoot().checkAndMarkAsActive()){
			this.comment.hide();
			this.editorActions.activate();
		}
	},


	deactivateEditor: function(e){
		if(e){e.stopEvent();}
		if(this.getRoot().editorActive()){
			this.editorActions.deactivate();
			this.editorActions.setValue('');
			this.comment.show();
			this.getRoot().setEditorActive(false);
		}
		return false;
	},


	editorSaved: function(e){
		e.stopEvent();

		function callback(success, record){
			me.editor.unmask();
			if(success){
				me.deactivateEditor();
			}
		}

		var me = this,
			p = (LocationProvider.getPreferences() || {}).sharing || {},
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g,
			style = 'suppressed',
			v = me.editorActions.getValue(),
			note = v.body,
			sharing = v.shareWith || p.sharedWith || [],
			range,
			container = me.slide.get('ContainerId'),
			dom = me.slide.get('dom-clone');



		//Avoid saving empty notes or just returns.
		if( !Ext.isArray(note) || note.join('').replace(re,'') === '' ){
			me.deactivateEditor();
			return false;
		}

		range = dom.ownerDocument.createRange();
		range.selectNode(dom.firstChild);

		me.editor.mask('Saving...');
        try {
		    me.fireEvent('save-new-note', note, range, container, sharing, style, callback);
        }
        catch (error) {
            console.error('Error saving note - ' + Globals.getError(error));
            alert('There was an error saving your note.');
            me.editor.unmask();
        }
		return false;
	},


	editorKeyDown: function(event){
		event.stopPropagation();
		var k = event.getKey();
		if(k === event.ESC){
			this.deactivateEditor();
		}
	},


	editorKeyPressed: function(event){
		event.stopPropagation();
	}

},function(){
	var proto = this.prototype;

	proto.renderTpl = Ext.DomHelper.markup([
		{
			cls: 'comment',
			cn: [{
				cls: 'count',
				cn:[
					{tag: 'span',  html:'{count}'},
					' Comments'
				]
			},{
				cls: 'input',
				html: 'Write a comment'
			}]
		},
		TemplatesForNotes.getEditorTpl()
	]);
});
