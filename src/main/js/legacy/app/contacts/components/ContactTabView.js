const Ext = require('extjs');

const {getString} = require('legacy/util/Localization');
const StoreUtils = require('legacy/util/Store');
const User = require('legacy/model/User');
const GroupsStateStore = require('legacy/app/groups/StateStore');

require('./TabView');


module.exports = exports = Ext.define('NextThought.app.contacts.components.ContactTabView', {
	extend: 'NextThought.app.contacts.components.TabView',
	alias: 'widget.contacts-tab-view',

	navigation: {
		xtype: 'contacts-outline',
		cls: 'contact',
		subType: 'contact',
		outlineLabel: getString('NextThought.view.contacts.View.contact-tab')
	},

	body: {
		xtype: 'data-bound-panel',
		defaultType: 'contacts-tabs-card',
		items: [],
		ui: 'contacts-contact',
		cls: 'make-white contact-panel',
		emptyCmp: {
			xtype: 'box', emptyState: true,
			renderTpl: Ext.DomHelper.markup([{
				cls: 'empty-state', cn: [
					{cls: 'header', html: '{{{no_contact_header}}}'},
					{cls: 'sub', html: '{{{no_contact_sub}}}'}
				]
			}])
		}
	},

	subType: 'contact',

	initComponent: function () {
		this.callParent(arguments);

		this.GroupStore = GroupsStateStore.getInstance();
		this.buildStore();
	},

	buildStore: function () {
		var s = this.GroupStore.getAllContactsStore(),
			store = StoreUtils.newView(s);

		if (Ext.isFunction(this.filter)) {
			s.filter(this.filter);
		}

		if (store.model === User) {
			store.on('datachanged', 'injectLetterDividers', this);
			this.injectLetterDividers(store);
		}

		this.on('destroy', 'clearListeners', store);

		this.navigation.bindStore(store);
		this.body.bindStore(s);
		this.navigation.on({
			'afterrender': this.navigation.refresh.bind(this.navigation),
			single: true
		});

		this.body.doRefresh(s);
	}
});
