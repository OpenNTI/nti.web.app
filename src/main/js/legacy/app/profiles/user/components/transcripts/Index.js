const Ext = require('@nti/extjs');
const { User } = require('@nti/web-profiles');

require('internal/legacy/mixins/Router');
require('internal/legacy/overrides/ReactHarness.js');

const { Transcripts } = User;

module.exports = exports = Ext.define(
	'NextThought.app.profiles.user.components.transcripts.Index',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.user-profile-transcripts',

		columns: 7,
		layout: 'none',
		ui: 'profile-transcripts',
		cls: 'profile-transcripts',

		items: [],

		mixins: {
			Route: 'NextThought.mixins.Router',
		},

		userChanged: function (user, isMe) {
			this.activeUser = user;

			this.remove(this.transcriptsCmp);

			this.activeUser.getInterfaceInstance().then(modeledUser => {
				this.transcriptsCmp = this.add({
					xtype: 'react',
					component: Transcripts,
					entity: modeledUser,
				});
			});

			return Promise.resolve();
		},

		initComponent: function () {
			this.callParent(arguments);
		},
	}
);
