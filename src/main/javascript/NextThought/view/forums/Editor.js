Ext.define('NextThought.view.forums.Editor',{
	extend: 'Ext.Component',
	alias: 'widget.forums-topic-editor',

	requires:['NextThought.editor.Actions'],

	cls: 'forums-topic-editor-box',
	border: 1,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header-container', cn:
			{ cls: 'header', cn:[
				{ tag: 'tpl', 'if':'!isEdit', cn:{ cls: 'controls', cn:[
					{ cls: 'new-topic disabled', html: 'New Discussion'}
				] }},
				{ cls:'path', cn:['{path} / ',{tag:'span',cls:'title-part', html:'{title}'}]}
			]}
		},
		{ cls: 'forums-topic-editor', cn: {
			cls: 'editor active basic',
			cn:[{
				cls: 'main',
				cn:[{
					cls: 'title',
					cn:[{tag:'input', type:'text', placeholder: 'Title...'}]
				},{
					cls: 'aux',
					cn:[
						{cls: 'action publish on', 'data-qtip': 'Publish State'},
						{cls: 'tags'}
					]
				},{
					cls: 'content',
					contentEditable: true,
					unselectable: 'off',
					cn: [{ //inner div for IE
						html: '&#8203;' //default value (allow the cursor in to this placeholder div, but don't take any space)
					}]
				}]
			},{
				cls: 'footer',
				cn: [{
					cls: 'left',
					cn: [{cls: 'action whiteboard', 'data-qtip': 'Create a whiteboard'},
						{
							cls: 'action text-controls', 'data-qtip': 'Text Controls', cn:[
							{cls:'popover controls', cn:[
								{cls:'control bold', tabIndex:-1, 'data-qtip': 'Bold'},
								{cls:'control italic', tabIndex:-1, 'data-qtip': 'Italic'},
								{cls:'control underline', tabIndex:-1, 'data-qtip': 'Underline'}
							]}
						]
						}]
				},{
					cls: 'right',
					cn: [{cls:'action save', html: 'Save'},{cls:'action cancel', html: 'Cancel'}]
				}]
			}]
		}}
	]),


	renderSelectors: {
		editor: '.editor',
		cancelEl: '.action.cancel',
		saveEl: '.action.save',
		titleEl: '.title',
		footerEl: '.footer',
		editorBodyEl: '.content',
		publishEl: '.action.publish'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents(['save-post']);
	},


	beforeRender: function(){
		this.callParent(arguments);
		var rd = this.renderData = this.renderData || {};

		rd.path = this.path;
		rd.isEdit = Boolean(this.record);
		rd.title = rd.isEdit ? this.record.get('title') : 'New Topic';
	},


	afterRender: function(){
		this.callParent(arguments);
		var r = this.record,
			h,
			title = this.titleEl.down('input'),
			e = this.editorActions = new EditorActions(this,this.editor),
			parentCtEl = Ext.get('forums'),
			hasScrollBar = Ext.getDom(parentCtEl).scrollHeight !== parentCtEl.getHeight();

		this.mon(e.tags,'new-tag', this.syncHeight,this);
		this.mon(this.saveEl,'click', this.onSave, this);
		this.mon(this.cancelEl,'click', this.onCancel, this);
		this.on('beforedeactivate', this.onBeforeDeactivate, this);

		if( r ){
			h = r.get('headline');
			e.editBody(h.get('body'));
			e.setTitle(h.get('title'));
			e.setTags(h.get('tags'));
			e.setPublished(r.isPublished());
		}

		this.mon(this.titleEl.down('input'),'keyup',function(){ this.clearError(this.titleEl); },this);
		parentCtEl.addCls('scroll-lock'+ (hasScrollBar? ' scroll-padding-right':'')).scrollTo(0);
		Ext.EventManager.onWindowResize(this.syncHeight,this,null);
		Ext.defer(this.syncHeight,1,this);

		title.focus();
		this.moveCursorToEnd(title);
	},


	destroy: function(){
		Ext.get('forums').removeCls('scroll-lock scroll-padding-right');
		Ext.EventManager.onWindowResize(this.syncHeight,this,null);

		return this.callParent(arguments);
	},


	onBeforeDeactivate: function(){
		/*
		*   NOTE: For now, since forums views aren't destroyed when you go away,
		*   and we like that behavior, don't warn the user if the editor is open, since it will still be there when we can back.
		*   If we change at some point, just uncomment the following lines to display a warning message.
		*/
//		if(this.isVisible()){
//			this.warnBeforeDismissingEditor();
//		}
//		return !this.isVisible();
		return true;
	},


	warnBeforeDismissingEditor: function(){
		var msg = "You are currently editing or creating a discussion topic, please save or cancel it first.";
		Ext.defer(function(){ alert({msg: msg}); }, 1);
	},


	moveCursorToEnd: function(el) {
		//this is only for input/textarea elements
		el = Ext.getDom(el);
		if (typeof el.selectionStart === "number") {
			el.selectionStart = el.selectionEnd = el.value.length;
		}
		else if (el.createTextRange !== undefined) {
			el.focus();
			var range = el.createTextRange();
			range.collapse(false);
			range.select();
		}
	},


	syncHeight: function(){
		var el = this.editorBodyEl,
			p = document.getElementById('forums'),
			top;
		if(!el){
			return;
		}
		top = el.getTop() + p.scrollTop;

		el.setHeight(Ext.dom.Element.getViewportHeight() - top - this.footerEl.getHeight() - 10);
		Ext.defer(this.updateLayout,700,this,[]);
	},


	onKeyUp: function(){
		this.clearError(this.editorBodyEl);
	},


	clearError:function(el){ el.removeCls('error-top').set({'data-error-tip':undefined}); },


	markError: function(el,message){ el.addCls('error-tip').set({'data-error-tip':message}); },


	onSave: function(e){
		e.stopEvent();
		var v = this.editorActions.getValue(),
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g;

		if( !Ext.isArray(v.body) || v.body.join('').replace(re,'') === '' ){
			console.error('bad forum post');
			this.markError(this.editorBodyEl,'You need to type something');
			return;
		}

		if(Ext.isEmpty(v.title)){
			console.error('You need a title');
			this.markError(this.titleEl,'You need a title');
			this.titleEl.addCls('error-on-bottom');
			return;
		}

		//console.debug('Save:',v);
		//If new there will not be a record on this, it will be undefined
		this.fireEvent('save-post',this, this.record, v.title, v.tags, v.body, v.publish);
	},


	onSaveSuccess: function(){
		this.destroy();
	},


	onSaveFailure: function(rec, operation, response){
		var msg = 'An unknown error occurred saving your Thought.';

		//FIXME look at response code and give better errors.  Right
		//now we seem to just get 500s
		alert({title: 'Error', msg: msg, icon: 'warning-red'});
	},


	onCancel: function(e){
		e.stopEvent();

		//TODO: Logic... if edit go back to post, if new just destroy and go back to list.
		this.destroy();
	}
});
