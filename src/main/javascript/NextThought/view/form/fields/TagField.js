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
	regex: /[^\t\r\n\s,]+/,

	renderTpl: Ext.DomHelper.markup([
		{tag:'span', cls:'token-input-wrap', cn:[
			{tag:'input', type:'text', tabIndex: '{tabIndex}', placeholder: 'Tags'},
			{tag:'span', cls:'token-input-sizer', html:'####'}
		]}
	]),

	tokenTpl: Ext.DomHelper.createTemplate({tag: 'span', cls:'token', cn:[
		{tag:'span', cls:'value', html:'{0}'},
		{tag:'span', cls:'x'}
	]}),

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
		this.renderData = Ext.apply(this.renderData||{},{
			tabIndex: typeof this.tabIndex === 'number' ? this.tabIndex : -1
		});
	},


	getFocusEl: function(){return this.inputEl;},


	afterRender: function(){
		this.callParent();

		this.mon(this.el,'click',this.onClick,this);

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
			blur: this.onBlur
		});
	},


	onClick: function(e){
		e.stopEvent();
		var t = e.getTarget('.x',null,true),
			p = t ? t.up('.token') : null;
		if( t && p ){
			p.remove();
		}
		this.inputEl.focus();
	},


	isDelimiter: function(ch){
		return Boolean(String.fromCharCode(ch).match(/[\t\r\n\s,]/));
	},


	isToken: function(text) { return (text||'').match(this.regex); },

	onKeyDown: function(e){
		var el = this.inputEl,
			key = e.getKey(),
			val = el.getValue(),
			t;

		if (key === e.ENTER || key === e.TAB || this.isDelimiter(key)) {
			el.blur();
			if (this.isDelimiter(key) && key !== e.TAB){
				Ext.defer(el.focus,1,el);
			} else {
				this.fireEvent('blur',this);
			}
			e.stopEvent();
			return false;
		}

		if(key === e.BACKSPACE && !val) {
			t = this.el.query('.token').last();
			if(t){ Ext.fly(t).remove(); }
			e.stopEvent();
			return false;
		}
		return true;
	},


	updateSize: function(){
		var i = this.inputEl,
			v = i.getValue();
		this.sizerEl.update(v+'####');
		i[v?'removeCls':'addCls']('empty');
	},


	onBlur: function(){
		var el = this.inputEl,
			val = (el.getValue()||'').toLowerCase();

		if (!this.working) {
			this.working = true;
			if (this.isToken(val)) {
				el.dom.value = '';
				if(!Ext.Array.contains(this.getValue(),val)){
					this.tokenTpl.insertBefore(this.wrapEl,[val]);
				}
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
		this.el[readOnly?'addCls':'removeCls']('readOnly');
		this.inputEl[readOnly?'hide':'show']();
	},


	setValue: function(value){
		if(!this.rendered){
			Ext.Error.raise('Should only be called after rendering');
		}

		Ext.each(value||[],function(v){
			this.tokenTpl.insertBefore(this.wrapEl,[v]); },this);

		return this;
	},


	initValue: Ext.emptyFn,


	isValid: function() { return true; },


	getValue: function(){
		return Ext.Array.map(
			this.el.query('.token .value'),
			function(el){
				return el.innerHTML||'';
			}
		);
	}
});
