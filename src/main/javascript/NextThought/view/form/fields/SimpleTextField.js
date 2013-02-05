Ext.define('NextThought.view.form.fields.SimpleTextField',{
	extend: 'Ext.Component',
	alias: 'widget.simpletext',
	mixins: {
		placeholderFix: 'NextThought.view.form.fields.PlaceholderPolyfill'
	},

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
		this.callParent(arguments);
		this.mixins.placeholderFix.constructor.call(this);
		return this;
	},


	initComponent: function(){
		this.renderData = {
			type: this.inputType || 'text',
			placeholder: this.placeholder
		};
	},


	setError: function(){
		var e = this.inputEl;
		e.removeCls('error');//if there is an animation, we have to remove the class before it will play again.
		e.addCls('error');
	},


	clearValue: function(silent){
		var e = this.inputEl;
		e.dom.value = '';
		e.removeCls('error');
		this.clearEl.hide();
		this.keyPressed(new Ext.EventObjectImpl());
		if(!silent){
			this.focus();
			this.fireEvent('clear');
		}
	},


	reset: function(){
		this.clearValue(true);
	},


	getValue: function(){
		return this.inputEl.getValue();
	},


	setValue: function(v){
		this.update(v);
	},


    update: function(v){
        this.inputEl.dom.value = v;
	    this.inputEl[(v===''?'add':'remove')+'Cls']('empty');
	    this.clearEl[ v!==''?'show':'hide' ]();
        this.handleBlur();
    },


	afterRender: function(){
		this.callParent(arguments);
		var e = this.inputEl;
		e.addCls('empty');

		if(this.readOnly){
			e.set({readonly:'readonly'}); 
			this.clearEl.hide();
		}

		this.mon(e, {
			scope: this,
			keyup: this.keyPressed,
			contextmenu: function(e){e.stopPropagation();} //allow context on simple texts
		});
		this.mon(e, Ext.EventManager.getKeyEvent(), this.keyDown, this);

		this.mon(this.clearEl,'click',function(){this.clearValue();},this);
		this.lastValue = this.getValue();

		this.renderPlaceholder(e);
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

		//We need this to fit in more tightly with Ext's Field interface.
		if(event.isSpecialKey()){
            this.fireEvent('specialkey', this, new Ext.EventObjectImpl(event));
        }

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

		if(!this.readOnly){
			c[v?'show':'hide']();
		}

		e.removeCls('error');

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
		var valid,
			val = this.getValue()||'';

		this.inputEl.removeCls('error');
		valid = (this.allowBlank===false) ? (val.length >= (this.minLength||1)) : true;

		if(valid && this.validator){
			valid = Boolean(this.validator(val));
		}

		if(!silent && !valid){
			this.setError();
		}

		return valid;
	},


	isValid: function(){
		return this.validate(true);
	}
});

