Ext.define('NextThought.app.bundle.Index', {
	extend: 'NextThought.app.content.Index',
	alias: 'widget.bundle-view-container',

	state_key: 'bundle_index',

	requires: [
		'NextThought.app.library.content.StateStore'
	],

	mixins: {
		State: 'NextThought.mixins.State',
		Router: 'NextThought.mixins.Router'
	},

	items: [
		{xtype: 'box', autoEl: {html: 'bundle'}}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();
	},


	setActiveBundle: function(ntiid, bundle) {
		var me = this;

		ntiid = ntiid.toLowerCase();

		//if we are setting my current bundle no need to do anything
		if (me.activeBundle && (me.activeBundle.get('NTIID') || '').toLowerCase() === ntiid) {
			me.getActiveBundle = Promise.resolve(me.activeBundle);
		} else {
			me.getActiveBundle = me.ContentStore.onceLoaded()
				.then(function() {
					var current;
					//if the bundle was cached no need to look for it
					if (bundle && (bundle.getId() || '').toLowerCase() === ntiid) {
						current = bundle;
					} else {
						current = me.ContentStore.findContentBy(function(content) {
							return content.get('NTIID').toLowerCase() === ntiid;
						});
					}

					if (!current) {
						return Promise.reject('No bundle found for:', ntiid);
					}

					me.activeBundle = current;

					return current;
				});
		}

		return me.getActiveBundle;
	}
});