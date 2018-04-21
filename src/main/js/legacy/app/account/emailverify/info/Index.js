const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.app.account.emailverify.info.Index', {
	extend: 'Ext.Component',
	alias: 'widget.email-verify-info-view',

	cls: 'email-verify-view',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{
				cls: 'title', html: 'Why is Email Verification Needed?'
			},
			{
				cls: 'sub', html: 'Verifying your email is necessary to ensure successful communication, to facilitate account recovery, and to issue course completion badges.'
			}
		]},
		{cls: 'footer', cn: [
			{cls: 'controls', cn: [
				{tag: 'a', cls: 'button confirm', role: 'button', html: 'Done'}
			]}
		]}
	]),


	renderSelectors: {
		closeEl: '.footer .confirm'
	},


	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.closeEl, 'click', this.close.bind(this));
	},


	close: function () {
		if (this.onClose) {
			this.onClose();
		}
	}
});
