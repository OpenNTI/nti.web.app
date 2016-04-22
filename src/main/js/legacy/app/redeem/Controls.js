var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.redeem.Controls', {
	extend: 'Ext.Component',
	alias: 'widget.redeem-controls',

	cls: 'redeem-controls',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'a', cls: 'redeem disabled', tabindex: '1', html: 'Redeem'}
	]),


	renderSelectors: {
		redeemEl: '.redeem'
	},


	afterRender: function () {
		this.callParent(arguments);

		if (this.redeemText !== undefined) {
			this.setRedeemText(this.redeemText);
		}

		if (this.redeemEnabled) {
			this.enableRedeem();
		} else {
			this.disableRedeem();
		}

		this.mon(this.redeemEl, 'keypress', this.handleKeyPress.bind(this));
		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	enableRedeem: function () {
		if (!this.rendered) {
			this.redeemEnabled = true;
			return;
		}

		this.redeemEl.removeCls('disabled');
	},


	disableRedeem: function () {
		if (!this.rendered) {
			delete this.redeemEnabled;
			return;
		}

		this.redeemEl.addCls('disabled');
	},


	setRedeemText: function (text) {
		if (!this.rendered) {
			this.redeemText = text;
			return;
		}

		this[text ? 'removeCls' : 'addCls']('hidden');

		this.redeemEl.update(text || '');
	},

	handleKeyPress: function (e) {
		if (e.getTarget('.disabled')) { return; }

		if (e.charCode === e.ENTER && e.getTarget('.redeem')) {
			this.onRedeem();
		}
	},


	handleClick: function (e) {
		if (e.getTarget('.disabled')) { return; }

		if (e.getTarget('.redeem')) {
			this.onRedeem();
		} else if (e.getTarget('.cancel')) {
			this.onCancel();
		}
	},


	onRedeem: function () {
		if (this.doRedeem) {
			this.doRedeem();
		}
	}
});
