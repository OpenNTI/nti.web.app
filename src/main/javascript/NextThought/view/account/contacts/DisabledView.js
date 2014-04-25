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
				{ cls: 'disabled-title', html: '{{{NextThought.view.account.contacts.DisabledView.title}}}'},
				'{{{NextThought.view.account.contacts.DisabledView.description}}}',
				{tag: 'span', cls: 'resend-consent', html: '{{{NextThought.view.account.contacts.DisabledView.resend}}}'}
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
