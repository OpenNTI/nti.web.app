const Ext = require('@nti/extjs');
const {Transcripts} = require('@nti/web-profiles');

require('legacy/mixins/Router');
require('legacy/overrides/ReactHarness.js');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.transcripts.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.user-profile-transcripts',

	columns: 7,
	layout: 'none',
	ui: 'profile-transcripts',
	cls: 'profile-transcripts',

	items: [],

	mixins: {
		Route: 'NextThought.mixins.Router'
	},

	userChanged: function (user, isMe) {
		if (this.activeUser === user) {
			return Promise.resolve();
		}

		this.activeUser = user;

		if(!this.transcriptsCmp) {
			this.transcriptsCmp = this.add({
				xtype: 'react',
				component: Transcripts,
				entity: this.activeUser
			});
		}
		else {
			this.transcriptsCmp.setProps({entity: this.activeUser});
		}

		// update prop?

		return Promise.resolve();
	},

	initComponent: function () {
		this.callParent(arguments);
	}
});
