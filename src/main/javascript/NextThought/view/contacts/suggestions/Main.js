Ext.define('NextThought.view.contacts.suggestions.Main', {
	extend: 'Ext.view.View',
	alias: 'widget.suggest-contacts-view',

	cls: 'suggest-contacts',
	overItemCls: 'over',
	itemSelector: '.contact-card',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{
			cls: 'contact-card',
			cn: [
				{
					cls: 'avatar', style: {backgroundImage: 'url({avatarURL});'}
				},
				{
					cls: 'meta',
					cn: [
						{ cls: 'name', html: '{displayName}', 'data-field': 'name'},
						{ tag: 'tpl', 'if': '!hideProfile && email', cn: [
							{ cls: 'email', html: '{email}', 'data-field': 'email' }
						]},

						{ tag: 'tpl', 'if': '(role || affiliation)', cn: [
							{ cls: 'composite-line', cn: [
								{ tag: 'tpl', 'if': 'role', cn: [
									{ tag: 'span', html: '{role}', 'data-field': 'role'}
								]},
								{ tag: 'tpl', 'if': 'role && affiliation', cn: [
									{tag: 'span', cls: 'separator', html: ' {{{NextThought.view.contacts.Card.at}}} '}
								]},
								{ tag: 'tpl', 'if': 'affiliation', cn: [
									{ tag: 'span', html: '{affiliation}', 'data-field': 'affiliation' }
								]
								}
							]}
						]
						},
						{ tag: 'tpl', 'if': 'location', cn: [
							{ cls: 'location', html: '{location}', 'data-field': 'location' }
						]}
					]
				},
				{
					cls: 'add-to-contacts',
					cn: [
						{tag: 'a', cls: 'button add-contact', role: 'button', html: 'Add'}
					]
				}
			]
		}
	]}), {
		isContact: function(values) {
			var a = Ext.getStore('all-contacts-store');
			return a && a.contains(values.Username);
		}
	}),

	renderSelectors: {
		contactActionEl: '.add-to-contacts a'
	},


	initComponent: function() {
		this.callParent(arguments);
		if (!this.suggestedContactStore) {
			this.buildStore();
		}
		else {
			this.bindStore(this.suggestedContactStore);
		}
	},


	buildStore: function() {
		var peersStore,
			a = Ext.getStore('all-contacts-store'), me = this;

		$AppConfig.userObject.getSuggestContacts()
			.then(function(items) {
				if (Ext.isEmpty(items)) { return Promise.reject(); }

				peersStore = new Ext.data.Store({
					model: NextThought.model.User,
					proxy: 'memory',
					data: items,
					filters: [
						function(item) {
							return !(a && a.contains(item.get('Username')));
						}
					]
				});

				me.bindStore(peersStore);
			});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.selectedRecords = new Ext.util.MixedCollection();
		this.on('itemclick', 'itemClicked', this);
		this.__updateCount();
	},


	__updateCount: function() {
		var count = this.el.query('.selected').length;

		if (this.ownerCt && this.ownerCt.updateContactsCount) {
			this.ownerCt.updateContactsCount(count);
		}
	},


	itemClicked: function(view, record, item, index, e) {
		var targetEl = Ext.fly(e.getTarget());

		if (targetEl.hasCls('add-contact')) {
			targetEl.removeCls('add-contact');
			targetEl.addCls('selected');
			targetEl.setHTML('Selected');
			this.selectedRecords.add(record.getId(), record);
		}
		else if (targetEl.hasCls('selected')) {
			targetEl.removeCls('selected');
			targetEl.addCls('add-contact');
			targetEl.setHTML('Add');
			this.selectedRecords.remove(record);
		}
		this.__updateCount();
	},


	addContact: function(view, record, item) {
		var u = record && record.get('Username'), me = this;

		function finish() {
			me.refreshNode(me.store.indexOf(record));
		}

		if (u) {
			this.fireEvent('add-contact', u, null, finish);
		}

		this.__updateCount();
	},


	addAllContacts: function(finish) {
		var records = this.selectedRecords.getRange();
		if (!Ext.isEmpty(records)) {
			this.fireEvent('add-contacts', records, finish);
		}
	}

});
