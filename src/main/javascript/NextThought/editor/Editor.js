Ext.define('NextThought.editor.AbstractEditor',{
	extend: 'Ext.Component',

	mixins: {
		editorActions: 'NextThought.editor.Actions'
	},

	enableShareControls:false,
	enablePublishControls:false,
	enableTextControls:true,
	enableTags:false,
	enableTitle:false,
	enableWhiteboards:true,

	saveButtonLabel: 'Save',
	cancelButtonLabel: 'Cancel',
	placeholderText:'Type a message...',

	ui: 'editor',
	cls: 'editor',

	headerTplOrder: '{toolbar}{title}',

	titleTpl: Ext.DomHelper.markup([
		{tag:'tpl', 'if':'enableTitle', cn:{
			cls: 'title',
			cn:[{tag:'input', tabIndex:-1, type:'text', placeholder: 'Title...'}]
		}}
	]),

	renderSelectors:{
		saveButtonEl: '.action.save'
	},

	toolbarTpl: Ext.DomHelper.markup([{
		cls: 'aux', cn:[
			{tag:'tpl', 'if': 'enableShareControls', cn:{
				cls: 'recipients'
			}},
			{tag:'tpl', 'if':'enablePublishControls', cn:{
				cls: 'action publish on'
			}},
			{tag:'tpl', 'if': 'enableTags', cn:{
				cls:'tags'
			}}
		]
	}]),


	renderTpl: Ext.DomHelper.markup([
		'{header}',
		{
			cls: 'main',
			cn:[
				'{extra}',
				{
					cls: 'content show-placeholder',
					'data-placeholder':'{placeholderText}',
					contentEditable: true,
					unselectable: 'off',
					tabIndex:-1,
					cn: [{ //inner div for IE
						//default value (allow the cursor in to this placeholder div, but don't take any space)
						html: '&#8203;'
					}]
				}
			]
		}
		,{
			cls: 'footer',
			cn: [{
				cls: 'left',
				cn: [{
					cls: 'action whiteboard', 'data-qtip': 'Create a whiteboard'
				},{
					cls: 'action text-controls', 'data-qtip': 'Formatting Options', cn:[
						{cls:'popover', cn:[
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
		}
	]),


	onClassExtended: function (cls, data) {
		//Allow subclasses to override render selectors, but don't drop all of them if they just want to add.
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {}, cls.superclass.renderSelectors);

		//allow a header template to be defined
		data.headerTpl = data.headerTpl || cls.superclass.headerTpl || false;
		data.titleTpl = data.titleTpl || cls.superclass.titleTpl || false;
		data.toolbarTpl = data.toolbarTpl || cls.superclass.toolbarTpl || false;

		//merge in subclass's templates
		var tpl = this.prototype.renderTpl.replace('{header}', data.headerTpl || ''),
			o = data.headerTplOrder || this.prototype.headerTplOrder || '',
			topTpl = o.replace('{title}', data.titleTpl || '')
					  .replace('{toolbar}', data.toolbarTpl || '');

		tpl = tpl.replace('{extra}', topTpl || '');


		if (!data.renderTpl) {
			data.renderTpl = tpl;
		}
		//Allow the subclass to redefine the template and include the super's template
		else {
			data.renderTpl = data.renderTpl.replace('{super}', tpl);
		}
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},{
			cancelLabel: this.cancelButtonLabel,
			saveLabel: this.saveButtonLabel,
			enableShareControls: Boolean(this.enableShareControls),
			enablePublishControls: Boolean(this.enablePublishControls),
			enableTextControls: Boolean(this.enableTextControls),
			enableTags: Boolean(this.enableTags),
			enableTitle: Boolean(this.enableTitle),
			enableWhiteboards: Boolean(this.enableWhiteboards),
			placeholderText: this.placeholderText
		});
	},


	afterRender: function(){
		var aux;
		this.callParent(arguments);
		this.mixins.editorActions.constructor.call(this,this,this.el,this.el.parent());
		this.mon(this.el.down('.action.cancel'),'click',this.onCancel,this);
		this.mon(this.saveButtonEl,'click', function(e){
			if(e.getTarget('.disabled')){ e.stopEvent(); return; }
			this.onSave(e);
		},this);

		//Hide it, if it's empty.
		aux = this.el.down('.aux');
		if(aux && !aux.dom.hasChildNodes()){
			aux.remove();
		}

		this.maybeEnableSave();
	},


	clearError:function(el){
		if(!el){
			el = this.el.down('.content');
		}
		if(!el){ return; }
		el.removeCls('error-top').set({'data-error-tip':undefined});
	},


	markError: function(el,message){ el.addCls('error-tip').set({'data-error-tip':message}); },


	onCancel: function(e){
		e.stopEvent();
		this.deactivate();
		if(!this.isDestroyed){
			this.setValue('');
		}
	},


	onSave: function(e){
		e.stopEvent();
		var v = this.getValue(),
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g;

		if( !Ext.isArray(v.body) || v.body.join('').replace(re,'') === '' ){
			if(!this.fireEvent('no-body-content',this, this.contentEl)){
				return;
			}
		}

		if(this.titleEl && Ext.isEmpty(v.title)){
			if(!this.fireEvent('no-title-content',this, this.titleEl)){
				return;
			}
		}

		this.fireEvent('save',this, this.record, v, this.saveCallback || Ext.emptyFn);
	},


	//Mixin's can't replace existing functions...so lets call them directly and replace the Ext.Component impl's with ours
	disable:function(){ return this.mixins.editorActions.disable.apply(this,arguments); },
	enable:function(){ return this.mixins.editorActions.enable.apply(this,arguments); },
	focus:function(){ return this.mixins.editorActions.focus.apply(this,arguments); },
	onKeyDown:function(){ return this.mixins.editorActions.onKeyDown.apply(this,arguments); },
	onKeyUp:function(){
		this.clearError(this.contentEl);
		return this.mixins.editorActions.onKeyUp.apply(this,arguments); },
	reset: function(){ return this.mixins.editorActions.reset.apply(this,arguments);},
	onMouseUp:function(){ return this.mixins.editorActions.onMouseUp.apply(this,arguments); }


}, function(){

	Ext.define('NextThought.editor.Editor',{
		extend: 'NextThought.editor.AbstractEditor',
		alias: 'widget.nti-editor'
	});

});
