const Ext = require('@nti/extjs');
const { validate } = require('email-validator');

require('legacy/common/form/fields/TagField');

module.exports = exports = Ext.define('NextThought.common.form.fields.EmailTokenField', {
	extend: 'NextThought.common.form.fields.TagField',
	alias: ['widget.email-field'],
	cls: 'email-token-field',
	placeholder: 'Add a recipient',

	renderSelectors: {
		inputWrapEl: '.token-input-wrap',
		inputEl: '.tag-input'
	},

	renderTpl: Ext.DomHelper.markup([
		{tag: 'span', cls: 'token-input-wrap', cn: [
			{tag: 'input', type: 'text', cls:'tag-input', tabIndex: '{tabIndex}', placeholder: '{placeholder}'},
			{tag: 'span', cls: 'token-input-sizer', html: '{placeholder}##'}
		]}
	]),

	msgTpl: new Ext.XTemplate(Ext.DomHelper.markup({cls: 'msg-container', cn: [
		{cls: 'msg {cls}', html: '{msg}'}
	]
	})),

	initComponent () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {},{
			placeholder: (this.schema && this.schema.placeholder) || this.placeholder
		});
	},

	afterRender () {
		this.callParent(arguments);

		this.inputWrapEl.addCls('initial');
	},

	addTag (val, type, extraData) {
		const me = this,
			el = me.inputEl;
		let snip, t, cls = '';

		el.dom.value = '';
		if (!Ext.Array.contains(me.getValue(), val)) {
			snip = me.getSnippet(val);

			// Check to see if email is valid or not
			if (!validate(snip)) {
				cls = 'invalid';
			}

			t = me.tokenTpl.insertBefore(me.getInsertionPoint(), Ext.apply({
				text: snip,
				type: type,
				value: val,
				cls: cls
			}, extraData), true);
			if (val !== snip) {
				t.set({
					'data-qtip': val
				});
			}

			me.fireEvent('new-tag', val);

			if (this.getValue().length === 1 && this.inputEl.dom.placeholder === 'Add an email address') {
				this.setPlaceholderText('Add more...');
			}
		}

		return t;
	},
	appendToFormData (data) {
		data.append(this.schema.name, this.getValue());
	},

	showError (name, reason) {
		let config = {
			msg: reason,
			cls: 'error'
		};

		this.removeError();
		this.msgTpl.insertAfter(this.el, config);
	},

	removeToken: function (p) {
		if (p && p.remove) {
			p.remove();
		}

		if(this.getValue().length === 0 && this.inputEl.dom.placeholder === 'Add more...') {
			this.setPlaceholderText('Add an email address');
		}
	},

	removeError (name) {
		let dom = this.container && this.container.dom,
			oldError = dom.querySelector('.msg-container');

		if(oldError) { oldError.remove(); }
	},

	onKeyDown (e) {
		let el = this.inputEl,
			key = e.getKey(),
			val = el && el.getValue();

		if(key === e.BACKSPACE && !val) {
			let token = this.el.query('.token').last();
			this.removeToken(token);
			e.stopEvent();
			e.preventDefault();
		} else {
			this.callParent(arguments);
		}
	}
});
