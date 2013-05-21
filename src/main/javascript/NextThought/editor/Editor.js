Ext.define('NextThought.editor.Editor',{
	extend: 'Ext.Component',
	alias: 'widget.nti-editor',

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

	ui: 'editor',
	cls: 'editor basic',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'main',
			cn:[{tag:'tpl', 'if':'enableTitle', cn:{
				cls: 'title',
				cn:[{tag:'input', tabIndex:-1, type:'text', placeholder: 'Title...'}]
			}},{
				cls: 'content',
				contentEditable: true,
				unselectable: 'off',
				tabIndex:-1,
				cn: [{ //inner div for IE
					//default value (allow the cursor in to this placeholder div, but don't take any space)
					html: '&#8203;'
				}]
			}]
		},{
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
			enableWhiteboards: Boolean(this.enableWhiteboards)
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mixins.editorActions.constructor.call(this,this,this.el);
		this.mon(this.el.down('.action.cancel'),'click',this.onCancel,this);
		this.mon(this.el.down('.action.save'),'click',this.onSave,this);
	},


	clearError:function(el){ el.removeCls('error-top').set({'data-error-tip':undefined}); },


	markError: function(el,message){ el.addCls('error-tip').set({'data-error-tip':message}); },


	onCancel: function(e){
		e.stopEvent();
		this.deactivate();
		this.setValue('');
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
		return this.mixins.editorActions.onKeyDown.apply(this,arguments); },
	reset: function(){ return this.mixins.editorActions.reset.apply(this,arguments);},
	onMouseUp:function(){ return this.mixins.editorActions.onMouseUp.apply(this,arguments); }
});
