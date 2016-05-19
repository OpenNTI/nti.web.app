const Ext = require('extjs');
const TagField = require('legacy/common/form/fields/TagField');
const { validate } = require('email-validator');

module.exports = exports = Ext.define('NextThought.common.form.fields.EmailTokenField', {
	extend: 'NextThought.common.form.fields.TagField',
	alias: ['widget.email-field'],
	cls: 'email-token-field',
	placeholder: 'Add a recipient',

	renderSelectors: {
		emailCountEl: '.email-count',
		inputWrapEl: '.token-input-wrap'
	},

	renderTpl: Ext.DomHelper.markup([
		{tag: 'span', cls: 'token-input-wrap', cn: [
			{tag: 'input', type: 'text', cls:'tag-input', tabIndex: '{tabIndex}', placeholder: '{placeholder}'},
			{tag: 'span', cls: 'token-input-sizer', html: '{placeholder}##'}
		]},
		{tag: 'span', cls: 'email-count', html: ''}
	]),

	msgTpl: new Ext.XTemplate(Ext.DomHelper.markup({cls: 'msg-container', cn: [
		{cls: 'msg {cls}', html: '{msg}'}
	]
	})),

	initComponent () {
		this.callParent(arguments);

		this.numOfTags = 0;
		this.renderData = Ext.apply(this.renderData || {},{
			placeholder: (this.schema && this.schema.placeholder) || this.placeholder
		});
	},

	afterRender () {
		this.callParent(arguments);
		this.inputWrapEl.addCls('initial');
	},

	addTag (val, type, extraData) {
		const me = this, el = me.inputEl;
		let snip, t, cls = '';

		el.dom.value = '';
		if (!Ext.Array.contains(me.getValue(), val)) {
			snip = me.getSnippet(val);

			// Check to see if email is valid or not
			if (!validate(snip)) { cls = 'invalid'; }

			t = me.tokenTpl.insertBefore(me.getInsertionPoint(), Ext.apply({text: snip, type: type, value: val, cls: cls},extraData), true);
			if (val !== snip) {
				t.set({'data-qtip': val});
			}

			me.fireEvent('new-tag', val);
			this.updateNumberTags(1);
			if(this.numOfTags === 1) {
				this.setPlaceholderText('Add more...');
				this.inputWrapEl.removeCls('inital');
			}
		}

		return t;
	},

	removeToken (p) {
		if (p && p.remove) {
			p.remove();
			this.updateNumberTags(-1);
		}
	},

	appendToFormData (data) {
		data.append(this.schema.name, this.getValue());
	},

	updateNumberTags (num) {
		this.numOfTags = this.numOfTags + num;
		// this.emailCountEl.setHTML(`+${this.numOfTags}`);
	},

	getNumberTags () {
		return this.numOfTags;
	},

	showError (name, reason) {
		let config = {
				msg: reason,
				cls: 'error'
			}, dom = this.container && this.container.dom,
			oldError = dom.querySelector('.msg-container');

		if(oldError) { oldError.remove(); }
		this.msgTpl.insertAfter(this.el, config);
	}
});
