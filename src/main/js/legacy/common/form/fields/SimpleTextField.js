var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.common.form.fields.SimpleTextField', {
	extend: 'Ext.Component',
	alias: 'widget.simpletext',

	cls: 'textbox-base',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'input', type: '{type}', placeholder: '{placeholder}' },
		{ tag: 'span', cls: 'clear' }
	]),

	renderSelectors: {
		inputEl: 'input',
		clearEl: '.clear'
	},

	config: {
		inputType: 'text',
		placeholder: '',
		validator: null
	},


	silentIsValid: true,

	constructor: function(config) {
		delete config.autoEl;
		delete config.renderTpl;
		delete config.renderSelectors;
		this.callParent(arguments);
	},


	initComponent: function() {
		this.renderData = {
			type: this.getInputType(),
			placeholder: this.getPlaceholder()
		};
	},


	setError: function() {
		//if there is an animation, we have to remove the class before it will play again.
		this.inputEl.removeCls('error').addCls('error');
	},


	clearValue: function(silent) {
		var e = this.inputEl;
		e.dom.value = '';
		e.removeCls('error');
		this.clearEl.hide();

		if (!silent) {
			this.focus();
			this.fireEvent('clear');
			this.keyPressed(new Ext.EventObjectImpl());
		}
	},


	reset: function() {
		this.clearValue(true);
		this.keyPressed(new Ext.EventObjectImpl());
	},


	getValue: function() {
		if (this._value !== undefined) {
			return this._value;
		}

	   return this.inputEl.getValue();
	},


	setValue: function(v) { this.update(v); },

	__maybeTagEmpty: function(v) {
		var a = (Ext.isEmpty(v) ? 'add' : 'remove') + 'Cls',
			c = 'empty';
		this.inputEl[a](c);
		this[a](c);
	},

	update: function(v) {
		if (!this.rendered) {
			this._value = v;
			this.on({afterrender: this.update.bind(this, v), single: true});
			return;
		}
		this.inputEl.dom.value = v;
		this.__maybeTagEmpty(v);
		if (!this.readOnly) {
			this.clearEl[v !== '' ? 'show' : 'hide']();
		}
		//this.handleBlur();
	},


	afterRender: function() {
		this.callParent(arguments);
		var e = this.inputEl,
			monitors = {
				scope: this,
				focus: 'onInputFocus',
				keyup: 'keyPressed',
				paste: 'onPaste',
				contextmenu: function(e) { e.stopPropagation(); } //allow context menu
			};

		monitors[Ext.EventManager.getKeyEvent()] = 'keyDown';


		this.__maybeTagEmpty();

		if (this.readOnly) {
			e.set({readonly: 'readonly'});
			this.clearEl.hide();
		}

		if (e) {
			this.mon(e, monitors);
		}

		this.mon(this.clearEl, 'click', this.clearValue.bind(this, false));

		this.lastValue = this.getValue();
		delete this._value;
	},


	getFocusEl: function() { return this.inputEl; },


	specialKeys: {
		27: true,	//Ext.EventObject.prototype.ESC
		8: true,	//Ext.EventObject.prototype.BACKSPACE
		46: true	//Ext.EventObject.prototype.DELETE
	},


	keyDown: function(event) {
		var k = event.getKey();

		//We need this to fit in more tightly with Ext's Field interface.
		if (event.isSpecialKey()) {
			this.fireEvent('specialkey', this, new Ext.EventObjectImpl(event));
		}

		if (this.specialKeys[k]) {
			if (k === event.ESC) {
				if (this.inputEl.dom.value === '') {
					return;
				}
				this.clearValue();
			}
			event.stopPropagation();
			this.keyPressed(event);
		}
	},


	onInputFocus: function() {
		this.fireEvent('input-focus');
	},


	onPaste: function(e) {
		var me = this;
		if (!me.pasteTask) {
			me.pasteTask = new Ext.util.DelayedTask(me.keyPressed, me, [e]);
		}
		// since we can't get the paste data, we'll give the area a chance to populate
		me.pasteTask.delay(1, null, null, null);
	},


	keyPressed: function(event) {
		var e = this.inputEl, v = this.getValue(), c = this.clearEl,
			k = event.getKey && event.getKey();

		if (!this.readOnly) {
			c[v ? 'show' : 'hide']();
		}

		e.removeCls('error');

		if (k && (k === event.ENTER || k === event.ESC)) {
			this.fireEvent('commit', v, this);
		}

		if (this.lastValue !== v) {
			this.lastValue = v;
			this.__maybeTagEmpty(v);

			clearTimeout(this.__changeTimeout);

			this.__changeTimeout = setTimeout(this.fireEvent.bind(this, 'changed', v, this), 500);
		}
	},


	validate: function(silent) {
		var valid, val = this.getValue() || '';

		if (!silent) {
			this.inputEl.removeCls('error');
		}
		valid = (this.allowBlank === false) ? (val.length >= (this.minLength || 1)) : true;

		if (valid && this.validator) {
			//The docs say validator should return true or an error string, both of which are truthy here :/
			valid = Boolean(this.validator(val));
		}

		if (!silent && !valid) {
			this.setError();
		}

		return valid;
	},


	isValid: function() { return this.validate(this.silentIsValid); }
});

