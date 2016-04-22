const Ext = require('extjs');
const Form = require('legacy/common/form/Form');
const Controls = require('./Controls');

module.exports = exports = Ext.define('NextThought.app.redeem.Redeem', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-redemption',

	cls: 'library-redemption',
	layout: 'none',
	items: [],
	schema: [
		{type: 'text', cls: 'code', name: 'code', placeholder: 'Enter your redemption code'}
	],

	initComponent () {
		this.callParent(arguments);

		let {redeemLink, onFormSubmit} = this;

		this.label = this.add({
			xtype: 'label',
			cls: 'redeemLabel',
			text: 'Redeem'
		});

		this.form = this.add({
			xtype: 'common-form',
			schema: this.schema,
			onFormSubmit: onFormSubmit
		});

		this.redeemBtn = this.add({
			xtype: 'redeem-controls',
			redeemText: 'Redeem',
			doRedeem: this.doRedeem
		});
	},

	afterRender () {
		this.callParent(arguments);
		this.mon(this.form.el, 'keypress', this.handleKeyPress.bind(this));
	},

	handleKeyPress () {
		this.redeemBtn.enableRedeem();
	}
});
