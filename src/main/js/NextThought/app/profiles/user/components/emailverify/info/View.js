Ext.define('NextThought.app.profiles.user.components.emailverify.info.View', {
	extend: 'Ext.Component',
	alias: 'widget.email-verify-info-view',

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


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.closeEl, 'click', this.close.bind(this));
	},


	close: function() {
		if (this.ownerCt && this.ownerCt.close) {
			this.ownerCt.close();
		}
	}
});
