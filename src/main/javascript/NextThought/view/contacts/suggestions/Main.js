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
						{tag: 'tpl', 'if': 'this.isContact(values)', cn: [
							{tag: 'a', cls: 'button remove-contact', role: 'button', html: 'Remove'}
						]},
						{tag: 'tpl', 'if': '!this.isContact(values)', cn: [
							{tag: 'a', cls: 'button add-contact', role: 'button', html: 'Add'}
						]}
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
		Promise.all(this.loadSuggestedContacts())
			.then(this.__fillIn.bind(this));
	},


	loadSuggestedContacts: function() {
		var courses = Ext.getStore('courseware.EnrolledCourses'),
			links = [], course, toLoad = [], p;

		courses.each(function(entry) {
			course = entry.get('CourseInstance');
			if (course && course.hasLink('Classmates')) {
				links.push(course.getLink('Classmates'));
			}
		});

		Ext.each(links, function(link) {
			p = new Promise(function(fulfill, reject) {
				Service.request({
					url: link,
					method: 'GET'
				})
					.fail(function() {
						console.error('Failed to retrieve classmates');
						reject('Request Failed');
					})
					.done(function(responseText) {
						var o = Ext.JSON.decode(responseText, true),
							items = o && o.Items;

						fulfill(items);
					});
			});

			toLoad.push(p);
		});

		return toLoad;
	},


	__fillIn: function(courseClassmates) {
		var peersObj = {}, peers = [], me = this;

		Ext.each(courseClassmates, function(m) {
			for (var k in m) {
				// A dict will eliminate duplicate.
				if (m.hasOwnProperty(k)) {
					peersObj[k] = m[k];
				}
			}
		});

		for (var o in peersObj) {
			if (peersObj.hasOwnProperty(o)) {
				peers.push(peersObj[o]);
			}
		}

		this.store = new Ext.data.Store({
			model: NextThought.model.User,
			proxy: 'memory',
			data: peers
		});

		this.bindStore(this.store);
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


	removeContact: function(view, record, item) {
		var u = record && record.get('Username'), me = this;

		function finish() {
			me.refreshNode(me.store.indexOf(record));
		}

		if (u) {
			this.fireEvent('remove-contact', null, record.get('Username'), finish);
		}
	},


	addAllContacts: function(finish) {
		var records = this.selectedRecords.getRange();
		if (!Ext.isEmpty(records)) {
			this.fireEvent('add-contacts', records, finish);
		}
	}

});
