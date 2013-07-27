Ext.define('NextThought.view.profiles.parts.BlogEditor',{
	extend: 'NextThought.editor.Editor',
	alias: 'widget.profile-blog-editor',

	enableTags: true,
	enableTitle: true,
	enableVideo: true,
	enableShareControls: true,

	cls: 'blog-editor',
	headerTplOrder: '{title}{toolbar}',
	//TODO: update CSS to not require this nesting.
	renderTpl: Ext.DomHelper.markup({ cls: 'editor active', html:'{super}' }),

	renderSelectors: {
		cancelEl: '.action.cancel',
		saveEl: '.action.save',
		publishEl: '.action.publish',
		titleWrapEl: '.title',
		footerEl: '.footer',
		editorBodyEl: '.content'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents(['save-post']);
	},


	afterRender: function(){
		this.callParent(arguments);
		var r = this.record,
			h,
			profileEl = Ext.get('profile'),
			hasScrollBar = Ext.getDom(profileEl).scrollHeight !== profileEl.getHeight();

		this.mon(this.tags,'new-tag', this.syncHeight,this);

		if( r ){
			h = r.get('headline');
			this.editBody(h.get('body'));
			this.setTitle(h.get('title'));
			this.setTags(h.get('tags'));
			this.setSharedWith(r.getSharingInfo());
		}

		this.mon(this.titleWrapEl,'keyup',function(){ this.clearError(this.titleWrapEl); },this);
		profileEl.addCls('scroll-lock'+ (hasScrollBar? ' scroll-padding-right':'')).scrollTo(0);
		Ext.EventManager.onWindowResize(this.syncHeight,this,null);
		Ext.defer(this.syncHeight,1,this);

		this.titleEl.focus();
		this.moveCursorToEnd(this.titleEl);
	},


	destroy: function(){
		Ext.get('profile').removeCls('scroll-lock scroll-padding-right');
		Ext.EventManager.onWindowResize(this.syncHeight,this,null);

		return this.callParent(arguments);
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
			top;
		if(!el){
			return;
		}
		top = el.getTop();

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
		var v = this.getValue(),
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g, t;

		if( !Ext.isArray(v.body) || v.body.join('').replace(re,'') === '' ){
			console.error('bad blog post');
			this.markError(this.editorBodyEl,'You need to type something');
			return;
		}

		if(Ext.isEmpty(v.title)){
			console.error('You need a title');
			this.markError(this.titleWrapEl,'You need a title');
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if(/^[^a-z0-9]+$/i.test(v.title)){
			console.error('Title cant be all special chars');
			this.markError(this.titleWrapEl,"Title can't be all special characters.");
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if(/^@{1,}/.test(v.title)){
			console.error('Title cant start with @');
			this.markError(this.titleWrapEl,"Title can't start with @");
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		//console.debug('Save:',v);
		//If new there will not be a record on this, it will be undefined
		// NOTE: For now, as a matter of simplicit, we are ignoring the 'publish' field.
		// We will derive it from the sharedWith value. ~PM.
		this.fireEvent('save-post',this, this.record, v.title, v.tags, v.body, v.sharingInfo);
	},


	onSaveSuccess: function(){
		this.destroy();
	},


	onSaveFailure: function(proxy, response, operation){
		var msg = 'An unknown error occurred saving your Thought.', error;

		if(response && response.responseText){
			error = JSON.parse(response.responseText) || {};
			if(error.code === "TooLong"){
				msg = "Could not save your Thought. The title is too long. It can only be 140 characters or less";
			}
		}
		alert({title: 'Error', msg: msg, icon: 'warning-red'});
		console.debug(arguments);
	},


	onCancel: function(e){
		e.stopEvent();

		//TODO: Logic... if edit go back to post, if new just destroy and go back to list.
		this.destroy();
	}
});
