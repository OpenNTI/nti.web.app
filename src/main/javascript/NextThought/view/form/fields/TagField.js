Ext.define('NextThought.view.form.fields.TagField', {
	alternateClassName: 'NextThought.view.form.fields.TokenField',
	extend:             'Ext.Component',
	alias:              ['widget.tags', 'widget.tokens'],
	mixins:             {
		field:          'Ext.form.field.Field',
		placeholderFix: 'NextThought.view.form.fields.PlaceholderPolyfill'
	},
	cls:                'token-field',
	ui:                 'tokens',
	hideLabel:          true,
	delimiterRe:        /[\t\r\n\s,]/i,
	regex:              /^[^\t\r\n\s,]+$/,

	placeholder: 'Tags',


	renderTpl: Ext.DomHelper.markup([
										{tag: 'span', cls: 'token-input-wrap', cn: [
											{tag: 'input', type: 'text', tabIndex: '{tabIndex}', placeholder: '{placeholder}'},
											{tag: 'span', cls: 'token-input-sizer', html: '{placeholder}##'}
										]}
									]),


	tokenTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'token {type}', cn: [
		{tag: 'span', cls: 'value', html: '{text}', 'data-value': '{value}'},
		{tag: 'span', cls: 'x'}
	]}),


	renderSelectors: {
		wrapEl:  '.token-input-wrap',
		sizerEl: '.token-input-sizer',
		inputEl: 'input[type="text"]'
	},


	onClassExtended: function (cls, data) {
		//Allow subclasses to override render selectors, but don't drop all of them if they just want to add.
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {}, cls.superclass.renderSelectors);

		var tpl = this.prototype.renderTpl;

		if (!data.renderTpl) {
			data.renderTpl = tpl;
		}
		//Allow the subclass to redefine the template and include the super's template
		else {
			data.renderTpl = data.renderTpl.replace('{super}', tpl);
		}
	},


	initComponent: function () {
		this.callParent(arguments);
		this.xtypes.push('field');
		this.initField();
		this.setReadOnly(!!this.readOnly);
		this.renderData = Ext.apply(this.renderData || {}, {
			placeholder: this.placeholder,
			tabIndex: typeof this.tabIndex === 'number' ? this.tabIndex : -1
		});
	},


	getFocusEl: function () {return this.inputEl;},


	afterRender: function () {
		this.callParent();

		this.mon(this.el, 'click', this.onClick, this);

		this.mon(this.inputEl, {
			scope:    this,
			keydown:  this.updateSize,
			keypress: this.updateSize,
			keyup:    this.updateSize,
			focus:    this.updateSize
		});

		this.addInputListeners();
		this.renderPlaceholder(this.inputEl);
	},


	addInputListeners: function () {
		this.mon(this.inputEl, {
			scope:   this,
			keydown: this.onKeyDown,
			blur:    this.handleBlur,
			paste:   this.onPaste
		});
	},


	onBeforeRemoveToken: function (token) {},


	onClick: function (e) {
		e.stopEvent();
		var t = e.getTarget('.x', null, true),
				p = t ? t.up('.token') : null;
		if (t && p) {
			this.onBeforeRemoveToken(p);
			p.remove();
		}
		this.inputEl.focus();
	},


	to_ascii: {
		'188': 44,
		'109': 45,
		'190': 46,
		'191': 47,
		'192': 96,
		'220': 92,
		'222': 39,
		'221': 93,
		'219': 91,
		'173': 45,
		'187': 61,
		'186': 59,
		'189': 45
	},


	isDelimiter: function (ch) {

		//see http://jsfiddle.net/S2dyB/17/
		if (this.to_ascii.hasOwnProperty(ch)) {
			ch = this.to_ascii[ch];
		}

		return Boolean(String.fromCharCode(ch).match(this.delimiterRe));
	},


	isToken: function (text) { return (text || '').match(this.regex); },


	isMultipleTokens: function (text) {
		var me = this,
				t = (text || '').split(me.delimiterRe);
		t = Ext.Array.clean(t);
		return t.reduce(function (acc, val) { return acc && me.isToken(val); }, true);
	},


	onKeyDown: function (e) {
		var el = this.inputEl,
				key = e.getKey(),
				val = el.getValue(),
				t;

		if (key === e.ENTER || key === e.TAB || this.isDelimiter(key)) {
			this.updateTags();
			// is the following if/else statement necessary now?
			if (this.isDelimiter(key) && key !== e.TAB) {
				Ext.defer(el.focus, 1, el);
			} else {
				this.fireEvent('blur', this);
			}
			e.stopEvent();
			return false;
		}

		if (key === e.BACKSPACE && !val) {
			t = this.el.query('.token').last();
			if (t) {
				Ext.fly(t).remove();
			}
			e.stopEvent();
			return false;
		}
		return true;
	},


	setPlaceholderText: function (text) {
		this.placeholder = text;
		this.inputEl.set({'placeholder': text});
		this.updateSize();
	},


	updateSize: function () {
		var i = this.inputEl,
				v = i.getValue() || this.placeholder;
		this.sizerEl.update(v + '###');
		i[v ? 'removeCls' : 'addCls']('empty');
	},


	getInsertionPoint: function () {
		return this.wrapEl;
	},


	getSnippet: function (value) {
		return value; //In some cases we may want to truncate the value if it's too long.
	},


	addTag: function (val, type, extraData) {
		var me = this, el = me.inputEl, snip, t;

		el.dom.value = '';
		if (!Ext.Array.contains(me.getValue(), val)) {
			snip = me.getSnippet(val);
			t = me.tokenTpl.insertBefore(me.getInsertionPoint(), Ext.apply({text: snip, type: type, value: val}, extraData), true);
			if (val !== snip) {
				t.set({'data-qtip': val});
			}

			me.fireEvent('new-tag', val);
		}

		return t;
	},


	handleBlur: function () {
		this.updateTags();
		return true;
	},


	updateTags: function () {
		var me = this,
				el = me.inputEl,
				val = (el.getValue() || '').toLowerCase();

		if (!me.working) {
			me.working = true;
			if (me.isToken(val)) {
				me.addTag(val);
			} else if (me.isMultipleTokens(val)) {
				val = val.split(me.delimiterRe);
				val = Ext.Array.clean(val);
				Ext.each(val, me.addTag, me);
			}

			delete this.working;
		}
		return true;
	},


	onPaste: function (e) {
		//wait for paste data to actually populate tne input
		Ext.defer(this.updateTags, 100, this);
	},


	setReadOnly: function (readOnly) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setReadOnly, this, [readOnly]), this, {single: true});
			return;
		}
		this.readOnly = readOnly;
		this.el[readOnly ? 'addCls' : 'removeCls']('readOnly');
		this.inputEl[readOnly ? 'hide' : 'show']();
	},

//This MUST be reimplemented if the subclass redfines the value format
	setValue:    function (value) {
		if (value && !Ext.isArray(value)) {
			value = [value];
		}

		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setValue, this, [value]), this, {single: true});
			return this;
		}

		this.el.select('.token').remove();
		Ext.each(value || [], function (v) { this.addTag(v); }, this);

		return this;
	},


	//initValue: Ext.emptyFn,


	isValid: function () { return true; },


	getValue: function () {
		return Ext.Array.map(
				this.el.query('.token .value'),
				function (el) {
					return el.innerHTML || '';
				}
		);
	}
});
