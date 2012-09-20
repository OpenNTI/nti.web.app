Ext.define('NextThought.view.form.fields.SimpleTextField',{
	extend: 'Ext.Component',
	alias: 'widget.simpletext',

	cls: 'textbox-base',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'input', type:'{type}', placeholder: '{placeholder}' },
		{ tag: 'span', cls: 'clear' }]),

	renderSelectors: {
		inputEl: 'input',
		clearEl: '.clear'
	},

	constructor: function(config){
		delete config.autoEl;
		delete config.renderTpl;
		delete config.renderSelectors;
		return this.callParent(arguments);
	},


	initComponent: function(){
		this.renderData = {
			type: this.inputType || 'text',
			placeholder: this.placeholder
		};
	},


	setError: function(){
		var e = this.inputEl;
		e.addCls('error-saving');
		setTimeout(function(){ e.removeCls('error-saving'); },750);
	},


	clearValue: function(){
		var e = this.inputEl;
		e.dom.value = '';
		e.removeCls('error-saving');
		this.clearEl.hide();
		this.keyPressed(new Ext.EventObjectImpl());
		this.focus();
		this.fireEvent('clear');
	},


	getValue: function(){
		return this.inputEl.getValue();
	},


	afterRender: function(){
		this.callParent(arguments);
		var e = this.inputEl;
		e.addCls('empty');
		this.mon(e, {
			scope: this,
			keyup: this.keyPressed,
			keydown: this.keyDown //keypress does not always fire for escape
		});
		this.mon(this.clearEl,'click',this.clearValue,this);
		this.lastValue = this.getValue();
	},


	getFocusEl: function(){
		return this.inputEl;
	},


	specialKeys: {
		27: true,	//Ext.EventObject.prototype.ESC
		8: true,	//Ext.EventObject.prototype.BACKSPACE
		46: true	//Ext.EventObject.prototype.DELETE
	},


	keyDown: function(event) {
		var k = event.getKey();
		if(this.specialKeys[k]){
			if(k === event.ESC){
				if(this.inputEl.dom.value === ''){return;}
				this.clearValue();
			}
			event.stopPropagation();
			this.keyPressed(event);
		}
	},


	keyPressed: function(event){
		var e = this.inputEl,
			k = event.getKey(),
			v = this.getValue(),
			c = this.clearEl;

		c[v?'show':'hide']();

		if (k === event.ENTER || k === event.ESC ) {
			this.fireEvent('commit', v, this );
		}

		if( this.lastValue !== v ){
			this.lastValue = v;
			e[(v===''?'add':'remove')+'Cls']('empty');
			this.fireEvent('changed', v, this );
		}
	},



	validate: function(silent){
		var msg,valid,
				val = this.getValue()||'';

		valid = (this.allowBlank===false) ? (val.length >= (this.minLength||1)) : true;

		if(valid && this.validator){
			msg = this.validator(val);
			if(msg !== true){
				this.errorMessage = msg;
				valid = false;
			}
		}

		if(!silent && !valid){
			this.setError();
		}

		return valid;
	}

});

