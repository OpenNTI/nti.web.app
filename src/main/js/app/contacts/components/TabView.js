export default Ext.define('NextThought.app.contacts.components.TabView', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.contact-tab-view',

	requires: [
		'NextThought.app.contacts.components.Grouping',
		'NextThought.app.contacts.components.outline.View',
		'NextThought.common.components.BoundPanel'
	],

	mixins: {
		// Route: 'NextThought.mixins.Router'
	},


	navigation: { xtype: 'contacts-outline' },
	body: { xtype: 'data-bound-panel' },

	ui: 'contacts',
	cls: 'contact-sub-view',

	constructor: function(config) {
		this.callParent(arguments);
		this.mon(this.navigation, 'contact-row-selected', 'scrollIntoView');
		this.on('activate', this.onActivate.bind(this));
	},


	scrollIntoView: function(rec) {
		var query = Ext.String.format('[recordId="{0}"]', ParseUtils.escapeId(rec.getId())),
			cmp = this.body.down(query);

		if (cmp) {
			cmp.getEl().scrollIntoView(this.body.getEl());
			cmp.getEl().highlight('88d0f9');
		}
	},


	injectLetterDividers: function(store) {
		var User = NextThought.model.User,
			pluck = Ext.Array.pluck,
			letters = {}, toAdd = [];

		Ext.each(pluck(pluck(store.getRange(), 'data'), 'displayName'), function(v) {
			v = (v || '-')[0] || '-';
			letters[v.toUpperCase()] = 1;
		});

		Ext.each(Ext.Object.getKeys(letters), function(v) {
			var m = User.getUnresolved(v);
			m.set({
				//if usernames are obscured, this will have been replaced with "Anonymous XXX"...
				// we want the letter deviders, and since this doesn't represent an actual user...
				alias: v,
				type: 'unit'
			});
			if (store.findBy(function(r) { return r.get('type') === 'unit' && r.get('Username') === v; }) < 0) {
				toAdd.push(m);
			}
		});

		store.suspendEvents(false);
		store.add(toAdd);
		store.resumeEvents();
	},


	onActivate: function() {
		if (!this.rendered) { return; }
		this.alignNavigation();
		this.navigation.refresh();
	}

});
