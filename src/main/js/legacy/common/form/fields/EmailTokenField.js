const Ext = require('extjs');
const TagField = require('legacy/common/form/fields/TagField');

module.exports = exports = Ext.define('NextThought.common.form.fields.EmailTokenField', {
	extend: 'NextThought.common.form.fields.TagField',
	alias: ['widget.email-field'],
	cls: 'email-token-field',
	placeholder: 'Add a recipient',

	initComponent () {
		this.callParent(arguments);

		this.numOfTags = 0;
		this.renderData = Ext.apply(this.renderData || {},{
			placeholder: (this.schema && this.schema.placeholder) || this.placeholder
		});
	},

	afterRender () {
		this.callParent();
	},

	addTag (val, type, extraData) {
		var me = this, el = me.inputEl, snip, t;


		el.dom.value = '';
		if (!Ext.Array.contains(me.getValue(), val)) {
			snip = me.getSnippet(val);
			t = me.tokenTpl.insertBefore(me.getInsertionPoint(), Ext.apply({text: snip, type: type, value: val},extraData), true);
			if (val !== snip) {
				t.set({'data-qtip': val});
			}

			me.fireEvent('new-tag', val);
			this.updateNumberTags(1);
			if(this.numOfTags === 1) {
				this.setPlaceholderText('Add more...');
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
	},

	getNumberTags () {
		return this.numOfTags;
	}
});
