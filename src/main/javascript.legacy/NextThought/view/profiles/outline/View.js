Ext.define('NextThought.view.profiles.outline.View', {
	extend: 'Ext.Component',
	alias: 'widget.profile-outline',

	//<editor-fold desc="Config">

	ui: 'profile',
	cls: 'outline',

	renderTpl: Ext.DomHelper.markup({cls: 'container', cn: [
		{cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'}},
		{cls: 'fixed-about', cn: [
			{cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'}},
			{cls: 'fixed-name {presence}', html: '{displayName}'}
		]},
		{cls: 'wrap', cn: [
			{cls: 'about', cn: [
				{cls: 'name {presence} field', html: '{displayName}'},
				{cls: 'role field', html: '{role}'},
				{cls: 'location field', html: '{location}'}
			]},
			{cls: 'controls {controlsCls}', cn: [
				{tag: 'span', cls: 'button edit isMe', html: '{{{NextThought.view.profiles.outline.View.edit}}}'},
				{tag: 'span', cls: 'button add-contact notContact', html: '{{{NextThought.view.profiles.outline.View.add}}}'},
				{tag: 'span', cls: 'button cancel isMe editing', html: 'Cancel'},
				{tag: 'span', cls: 'button save isMe editing', html: 'Save'},
				{tag: 'span', cls: 'button contact-menu isContact'},
				//{tag: 'span', cls: 'button mail isContact'},
				{tag: 'span', cls: 'button chat isContact'}
			]},
			{cls: 'nav'}
		]}
	]}),

	renderSelectors: {
		headerEl: '.container',
		avatarEl: '.avatar',
		avatarEl2: '.fixed-about .avatar',
		nameEl: '.name',
		controlsEl: '.controls',
		roleEl: '.role',
		locationEl: '.location',
		chatEl: '.chat'
	},

	//</editor-fold>


	//<editor-fold desc="Init & Render">
	initComponent: function() {
		this.callParent(arguments);
		this.monitorUser(this.user);

		this.on({
			avatarEl: {click: 'onControlsClicked'},
			controlsEl: {click: 'onControlsClicked'},
			nameEl: {click: 'onNameClicked'},
			'uneditable-name': 'markNameUneditable'
		});
	},


	beforeRender: function() {
		this.callParent(arguments);
		this.applyRenderData(this.user);
	},


	afterRender: function() {
		this.callParent(arguments);

		var store, data = [];

		if (isMe(this.user) || !Service.canFriend()) {
			this.controlsEl.select('.contact-menu,.add-contact').addCls('disabled');

			if ($AppConfig.disableProfiles === true) {
				this.controlsEl.down('.edit').addCls('disabled');
			}
		}

		if (!Service.canChat()) {
			this.controlsEl.down('.chat').addCls('disabled');
		}

		if (this.nameUneditable) {
			this.markNameUneditable();
		}

		this.updateButton();

		data.push({id: 'about', label: getString('NextThought.view.profiles.outline.View.about'), mapping: 'profile-about' });
		data.push({id: 'activity', label: getString('NextThought.view.profiles.outline.View.activity'), mapping: 'profile-activity' });

		if (isFeature('badges')) {
			data.push({id: 'achievments', label: getString('NextThought.view.profiles.outline.View.achievements'), mapping: 'profile-achievements'});
		}

		data.push({id: 'blog', label: getString('NextThought.view.profiles.outline.View.thoughts'), mapping: 'profile-blog' });

		/*
			{id:'discussions', label:'Discussions', type:'filter', mapping:'profile-activity' },
			{id:'chats', label:'Chats', type:'filter', mapping:'profile-activity' },
			{id:'comments', label:'Comments', type:'filter', mapping:'profile-activity' },
			{id:'highlights', label:'Highlights', type:'filter', mapping:'profile-activity' },
			{id:'bookmarks', label:'Bookmarks', type:'filter', mapping:'profile-activity' },
			{id:'like', label:'Likes', type:'filter', mapping:'profile-activity' }
		*/

		store = new Ext.data.Store({
			fields: [
				{name: 'id', type: 'string'},
				{name: 'label', type: 'string'},
				{name: 'count', type: 'int', defaultValue: 0},
				{name: 'type', type: 'string', defaultValue: 'view'},//or filter
				{name: 'mapping', type: 'string'}
			],
			data: data
		});

		this.navStore = store;
		this.nav = Ext.widget({
			xtype: 'dataview',
			ui: 'nav',
			preserveScrollOnRefresh: true,
			overItemCls: 'over',
			itemSelector: '.outline-row',
			store: store,
			cls: 'nav-outline static',
			renderTo: this.el.down('.nav'),
			selModel: {
				allowDeselect: false,
				toggleOnClick: false,
				deselectOnContainerClick: false
			},
			tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
				{
					cls: 'outline-row', 'data-text': '{label}',
					cn: [
						{ tag: 'tpl', 'if': 'count', cn: { cls: 'count', html: '{count}' } },
						{ cls: 'label', html: '{label}'}
					]
				}
			]}),
			listeners: {
				scope: this,
				select: 'selectionChanged',
				beforeselect: 'beforeSelect'
			}
		});

		this.setHeight(this.getHeight());

		this.fixedPosition = {
			left: this.getX() + 'px'
		};

		this.nonFixedPosition = {
			left: '0px'
		};

		this.on('destroy', 'destroy', this.nav);

		this.mon(Ext.getStore('PresenceInfo'), 'presence-changed', 'updatePresence');

		this.updatePresence(this.user.getId());
	},


	applyRenderData: function(user) {
		if (this.rendered && user && user.getId() === this.user.getId()) { return; }

		var m;
		this.isMe = isMe(user);
		this.isContact = Ext.getStore('FriendsList').isContact(this.user);

		m = this.optionsMenu = Ext.widget({xtype: 'person-options-menu', width: 255, ownerCmp: this, user: this.user, isContact: this.isContact });
		m.add({xtype: 'management-group-list', allowSelect: true});

		this.groupsList = m.down('management-group-list');
		this.groupsList.setUser(user).isContact = this.isContact;
		this.mon(this.groupsList, 'added-contact', 'convertToContact');

		m.mon(this, 'destroy', 'destroy');
		m.on('hide-menu', 'hide');
		this.mon(m, 'remove-contact-selected', 'onDeleteContact');


		this.renderData = Ext.apply(this.renderData || {},user.getData());
		Ext.apply(this.renderData, {
			isMe: this.isMe,
			isContact: this.isContact,
			presence: user.getPresence().getName() + (this.isContact || this.isMe ? '' : ' no-presence'),
			controlsCls: this.isMe ? 'isMe' : this.isContact ? 'isContact' : 'notContact'
		});
	},
	//</editor-fold>


	//<editor-fold desc="Handlers">

	monitorUser: function(u) {
		var me = this,
			m = {
				destroyable: true,
				scope: this,
				changed: function(r) {
					me.applyRenderData(r);
					if (me.rendered) {
						me.updateAvatar(r);
						me.nameEl.update(r.getName());
					}
					me.monitorUser((r !== u) ? r : null);
				}
		};

		if (u) {
			Ext.destroy(me.userMonitor);
			me.userMonitor = me.mon(u, m);
			me.user = u;
		}

		if (!me.user) { return; }

		if (me.nameEl) {
			me.updateButton();
		}

		if (me.roleEl) {
			me.roleEl.update(me.user.get('role'));
		}

		if (me.locationEl) {
			me.locationEl.update(me.user.get('location'));
		}
	},


	updatePresence: function(username, presence) {
		//if the update isn't for this user don't do a thing
		if (username !== this.user.getId()) { return; }

		if (!presence) {
			presence = Ext.getStore('PresenceInfo').getPresenceOf(username);
		}

		//if we still don't have a presence they aren't loaded yet so just wait
		if (!presence) {
			this.chatEl.addCls('x-hidden');
			return;
		}

		if (presence.isOnline()) {
			this.chatEl.removeCls('x-hidden');
		} else {
			this.chatEl.addCls('x-hidden');
		}

		this.nameEl.removeCls(['available', 'Online', 'unavailable', 'away', 'dnd', 'dnd', 'offline']);

		this.nameEl.addCls(presence.getName() + ((this.isContact || this.isMe) ? '' : ' no-presence'));
	},


	onControlsClicked: function(e) {
		e.stopEvent();
		if (e.getTarget('.disabled')) {
			return;
		}

		if (e.getTarget('.contact-menu') && e.getTarget('.controls.isContact')) {
			this.optionsMenu.showBy(e.getTarget('.contact-menu'), 'tl-bl');
		}
		else if (e.getTarget('.avatar')) {
			if (this.hasCls('editing')) {
				this.fireEvent('edit');
			}
		}
		//the various states of the action button (default, edit, and chat)
		else if (e.getTarget('.button.edit') && !e.getTarget('.editing') && e.getTarget('.controls.isMe')) {
			this.enableEditing();
		}
		else if (e.getTarget('.button.editing')) {
			this.doneEditing(e.getTarget('.save'));
		}
		else if (e.getTarget('.button.chat') && e.getTarget('.controls.isContact')) {
			this.fireEvent('chat', this.user);
		}
		else if (e.getTarget('.button.add-contact') && e.getTarget('.controls.notContact')) {
			this.onAddContact();
		}

	},


	onNameClicked: function(e) {
		var t = e.getTarget('.name');
		e.stopEvent();
		if (t) {
			this.fireEvent('name-clicked', t, this, this.username, this.user);
		}
	},


	onAddContact: function() {
		var me = this,
			data = this.getSelected(),
			fin = function() {
				me.convertToContact();
			};

		this.fireEvent('add-contact', this.user, data.groups, fin);
	},


	onDeleteContact: function() {
		var me = this,
			data = this.getSelected(),
			fin = function() { me.convertToStranger(); };

		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		alert({
			msg: getString('NextThought.view.profiles.outline.View.warn'),
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': getString('NextThought.view.profiles.outline.View.delete')},
			title: getString('NextThought.view.profiles.outline.View.confirm'),
			fn: function(str) {
				if (str === 'ok') {
					me.fireEvent('delete-contact', me.user, data.groups, fin);
				}
			}
		});

	},


	selectionChanged: function(sel, rec) {
		var d = (rec && rec.getData()) || {};

		this.fireEvent('show-profile-view', d.mapping, d.type, d.id);
	},


	beforeSelect: function() {
		return this.fireEvent('allow-view-change');
	},


	updateSelection: function(active, fromUser) {
		var view = active.xtype || active, result, selModel,
			i = this.navStore.findBy(function(r) {
				return r.get('type') === 'view' && r.get('mapping') === view;
			});

		//if we are editing and don't allow a new selection
		if (this.hasCls('editing')) {
			return;
		}

		selModel = this.nav.getSelectionModel();

		selModel.select(i, false, fromUser !== true);

		//check if the selection changed or it was cancled
		result = selModel.getSelection()[0];
		return result.get('mapping') === view;
	},
	//</editor-fold>


	//<editor-fold desc="UI Manipulations">
	updateAvatar: function(user) {
		var HOST = Globals.HOST_PREFIX_PATTERN,
			avatarURL = user.get('avatarURL'),
			currentURL = this.avatarEl.getStyle('background-image').slice(4, -1), a, b, d;

		if (avatarURL && avatarURL.indexOf('//') === 0) {
			avatarURL = location.protocol + avatarURL;
		}

		a = HOST.exec(avatarURL);
		b = HOST.exec(currentURL);
		d = HOST.exec(location)[0];//default host

		a = (a && a[0]) || d;
		b = (b && b[0]) || d;

		currentURL = currentURL.replace(HOST, '') === avatarURL.replace(HOST, '');

		if (!currentURL || a !== b) {
			this.avatarEl.setStyle({backgroundImage: 'url(' + avatarURL + ')'});
			this.avatarEl2.setStyle({backgroundImage: 'url(' + avatarURL + ')'});
		}
	},


	convertToContact: function() {
		this.isContact = true;
		this.applyRenderData(this.user);

		if (this.rendered && !this.isDestroyed && !this.destroying) {
			//this.controlsEl.down('.button').set({cls: 'button chat disabled'}).update('Chat');
			this.nameEl.removeCls('no-presence');
			this.controlsEl.removeCls('isMe notContact').addCls('isContact');
			this.updateButton();
		}
	},


	convertToStranger: function() {
		//this.controlsEl.down('.button').set({cls: 'button'}).update(getString('NextThought.view.profiles.outline.View.add'));
		this.isContact = false;
		this.applyRenderData(this.user);
		this.nameEl.addCls('no-presence');
		this.updateButton();
		this.controlsEl.removeCls('isMe isContact').addCls('notContact');
	},


	enableEditing: function(enable) {
		enable = enable !== false;

		var editEl = this.controlsEl.down('.edit');

		if (enable && !this.updateSelection('profile-about', true)) {
			return;
		}

		this.fireEvent('enable-edit');
		this.nav.mask();
		this.addCls('editing');
		editEl.addCls('editing');
	},


	/**
	 * Fires the event to let the about page set it editing state
	 * @param  {boolean} save truthy to save the changes, falsy to cancel the changes
	 * @return {boolean}      true if the about page quit editing, false if it didn't
	 */
	doneEditing: function(save) {
		var me = this;

		function finish(success) {
			var editEl = me.controlsEl.down('.edit');

			if (success) {
				me.nav.unmask();
				me.removeCls('editing');
				editEl.removeCls('editing');
			}
		}

		me.fireEvent(save ? 'save-edits' : 'cancel-edits', finish);
	},


	markNameUneditable: function() {
		this.nameUneditable = true;

		if (this.rendered) {
			this.nameEl.addCls('read-only');
		}
	},


	updateButton: function() {},
	//</editor-fold>


	//<editor-fold desc="Methods">
	isUserOnline: function() {
		var o = Ext.getStore('online-contacts-store'), k = 'Username';
		return Boolean(o.findRecord(k, this.user.get(k)));
	},


	getSelected: function() {
		var l = this.groupsList;
		return {
			user: this.user.getId(),
			groups: l ? l.getSelected() : []
		};
	},


	removeNavigationItem: function(navMapping) {
		var toRemove = [];
		if (!this.navStore) {
			return;
		}
		this.navStore.each(function(r) {
			if (r.get('mapping') === navMapping) {
				toRemove.push(r);
			}
		});

		if (Ext.isEmpty(toRemove)) {
			console.warn('Did not remove any nodes, no mapping "', navMapping, '" found');
			return;
		}

		this.navStore.remove(toRemove);
	},


	maybeFixHeader: function(el) {
		if (!el) { return false; }

		el = Ext.get(el);

		var navTop = this.nav && this.nav.getY(),
			scrollTop = el.getScrollTop(),
			delta = navTop - scrollTop,
			threshold = -81;

		if (navTop && delta <= threshold && !this.fixedHeader) {
			this.addCls('fixed');
			//this.el.setStyle(this.fixedPosition);
			this.fixedHeader = true;
		} else if (delta > threshold && this.fixedHeader) {
			this.removeCls('fixed');
			//this.el.setStyle(this.nonFixedPosition);
			this.fixedHeader = false;
		}

		return this.fixedHeader;
	}
	//</editor-fold>
});
