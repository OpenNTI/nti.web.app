Ext.define('NextThought.view.form.fields.TagField',{
	alternateClassName: 'NextThought.view.form.fields.TokenField',
	extend: 'Ext.Component',
	alias: ['widget.tags','widget.tokens'],
	mixins: {
		field: 'Ext.form.field.Field'
	},
	cls: 'token-field',
	ui: 'tokens',
	hideLabel: true,
	delimiters: '\t\n ,',
	regex: /[^\t\n ,]+/,

	renderTpl: Ext.DomHelper.markup([
		{tag:'input', type:'hidden', value:'{value}'},
		{tag:'span', cls:'token-input-wrap', cn:[
			{tag:'input', type:'text', size:'1', placeholder: 'Tags'},
			{tag:'span', cls:'token-input-sizer', html:'####'}
		]}
	]),

	tokenTpl: Ext.DomHelper.createTemplate({tag: 'span', html:'{0}', cls:'token'}),

	renderSelectors: {
		wrapEl: '.token-input-wrap',
		sizerEl: '.token-input-sizer',
		inputEl: 'input[type="text"]',
		valueEl: 'input[type="hidden"]'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.xtypes.push('field');
		this.initField();
		this.setReadOnly(!!this.readOnly);
	},


	afterRender: function(){
		this.callParent();

		this.mon(this.el,'click',function(e){e.stopEvent();this.inputEl.focus();},this);

		this.mon(this.inputEl,{
			scope: this,
			keydown: this.updateSize,
			keypress: this.updateSize,
			keyup: this.updateSize,
			focus: this.updateSize
		});

		this.mon(this.inputEl,{
			scope: this,
			keydown: this.onKeyDown,
			keypress: this.onKeyPress,
			blur: this.onBlur
		});
	},


	isDelimiter: function(ch){
		return String.fromCharCode(ch).match(new RegExp('['+this.delimiters+']'));
	},


	isToken: function(text) { return (text||'').match(this.regex); },

	onKeyDown: function(e){
		var el = this.inputEl;
		if (e.getKey() === e.TAB && el.getValue()) {
			el.blur();
			Ext.defer(el.focus,1,el);
			e.stopEvent();
			return false;
		}
		return true;
	},


	onKeyPress: function(e){
		var el = this.inputEl,
				key = e.getKey();
		if (key === e.ENTER || this.isDelimiter(key)) {
			el.blur();
			if (this.isDelimiter(key)){
				Ext.defer(el.focus,1,el);
			}
			e.stopEvent();
			return false;
		}
		return true;
	},


	updateSize: function(){
		var v = this.inputEl.getValue();
		this.sizerEl.update(v+'####');
	},


	onBlur: function(){
		var el = this.inputEl,
			val = el.getValue();
		console.log('Blurred',val);
		if (!this.working) {
			this.working = true;
			if (this.isToken(val)) {
				el.dom.value = '';
				this.tokenTpl.insertBefore(this.wrapEl,[val]);
				this.el.repaint();
			}

			delete this.working;
		}
		return true;
	},


	setReadOnly: function(readOnly){
		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setReadOnly,this,[readOnly]),this,{single:true});
			return;
		}
		this.readOnly = readOnly;
		this.inputEl[readOnly?'hide':'show']();
	},


	setValue: function(value){

		return this;
	},


	initValue: function(){
	},


	isValid: function() {
		return true;
	},


	getValue: function(){
		return [];
	}
});
