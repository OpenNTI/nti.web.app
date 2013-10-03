Ext.define('NextThought.view.account.contacts.DisabledView', {
	extend: 'Ext.Component',
	alias: 'widget.disabled-contacts-view',

	title: 'Chat',
	tabConfig: {
		tooltip: 'Chat'
	},

	iconCls: 'contacts',
	ui: 'contacts',

	renderTpl: Ext.DomHelper.markup({
		cls: 'disabled-contacts-view',
		cn: [
			{ cls: 'disabled-message-div', cn: [
				{ cls: 'disabled-title', html: 'Social Features Disabled...'},
				'We need your parent\'s permission to give you more features.  ',
        {tag: 'span', cls: 'resend-consent', html: 'Resend Consent Form'}
			]}
		]
	}),

	renderSelectors: {
		resend: '.resend-consent'
	},

	listeners: {
		afterRender: 'attachClickListener'
	},

	attachClickListener: function() {
		var me = this;
		this.mon(this.resend, 'click', function() {me.fireEvent('resend-consent');});
	}
});
