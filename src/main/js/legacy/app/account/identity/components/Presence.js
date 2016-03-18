var Ext = require('extjs');
var ComponentsPresenceEditor = require('./PresenceEditor');
var CacheAbstractStorage = require('../../../../cache/AbstractStorage');
var ChatStateStore = require('../../../chat/StateStore');
var ChatActions = require('../../../chat/Actions');


//styles in identity.scss
module.exports = exports = Ext.define('NextThought.app.account.identity.components.Presence', {
    extend: 'Ext.Component',
    alias: 'widget.presence-menu',
    cls: 'presence-menu',
    ui: 'presence-menu',
    sessionKey: 'presence-state',

    renderTpl: Ext.DomHelper.markup([
		{cls: 'header', html: '{{{NextThought.view.menus.Presence.header}}}'},
		{cls: 'list', cn: [
			{tag: 'tpl', 'for': 'states', cn: [
				{cls: 'status {state}', cn: [
					{tag: 'tpl', 'if': 'editable', cn: {cls: 'edit', 'data-placeholder': '{label}'}},
					{cls: 'label', html: '{label}'},
					{cls: 'presence {state}'}
				]}
			]}
		]}
	]),

    renderSelectors: {
		availableEl: '.list .available',
		awayEl: '.list .away',
		dndEl: '.list .dnd',
		offlineEl: '.list .offline'
	},

    defaultStates: {
		'available': getString('NextThought.view.menus.Presence.available'),
		'away': getString('NextThought.view.menus.Presence.away'),
		'dnd': getString('NextThought.view.menus.Presence.dnd'),
		'offline': getString('NextThought.view.menus.Presence.offline')
	},

    currentPreference: {},

    beforeRender: function() {
		var me = this;

		me.callParent(arguments);

		me.ChatStore = NextThought.app.chat.StateStore.getInstance();
		me.ChatActions = NextThought.app.chat.Actions.create();

		me.renderData = Ext.apply(me.renderData || {}, {
			states: [
				{state: 'available', label: me.defaultStates.available, editable: true},
				{state: 'away', label: me.defaultStates.away, editable: true},
				{state: 'dnd', label: me.defaultStates.dnd, editable: true},
				//{state: 'invisible', label: 'Invisible'},
				{state: 'offline', label: me.defaultStates.offline}
			]
		});

		$AppConfig.Preferences.getPreference('ChatPresence')
			.then(function(value) {
				if (value) {
					me.currentPreference.Active = value.get('Active');
					me.currentPreference.Available = value.get('Available');
					me.currentPreference.Away = value.get('Away');
					me.currentPreference.DND = value.get('DND');

					me.restoreState();
				} else {
					console.log('No ChatPresence preference returned');
				}
			});
	},

    afterRender: function() {
		this.callParent(arguments);

		var presence = this.ChatStore.getPresenceOf($AppConfig.username);

		this.setPresence($AppConfig.username, presence);

		this.setUpEditor();

		this.mon(this.el, 'click', this.clicked.bind(this));

		this.mon(this.ChatStore, 'presence-changed', this.setPresence.bind(this));
	},

    onDestroy: function() {
		clearTimeout(this.deferHideParentMenusTimer);
		this.callParent(arguments);
	},

    deferHideParentMenus: function() {
		Ext.menu.Manager.hideAll();
	},

    updatePreference: function(record, type, show, status) {
		record.set('type', type);
		record.set('show', show);
		record.set('status', status);
		record.save();
	},

    savePreferenceValues: function(record, key, type, show, status) {
		var me = this;

		if (!record) {
			console.error('No Record?!?!?!');
		}

		if (!record || record.isFuture) {
			$AppConfig.Preferences.getPreference(key)
				.then(function(value) {
					if (value) {
						me.updatePreference(value, type, show, status);
					}
				});
		} else {
			me.updatePreference(record, type, show, status);
		}
	},

    saveActive: function(type, show, status) {
		this.savePreferenceValues(this.currentPreference.Active, 'ChatPresence/Active', type, show, status);
	},

    savePreference: function(type, show, status) {
		var record, key;


		if (show === 'chat') {
			record = this.currentPreference.Available;
			key = 'ChatPresence/Available';
			status = (Ext.isEmpty(status)) ? this.defaultStates.available : status;
		}else if (show === 'away') {
			record = this.currentPreference.Away;
			key = 'ChatPresence/Away';
			status = (Ext.isEmpty(status)) ? this.defaultStates.away : status;
		}else if (show === 'dnd') {
			record = this.currentPreference.DND;
			key = 'ChatPresence/DND';
			status = (Ext.isEmpty(status)) ? this.defaultStates.dnd : status;
		}

		if (!record || !key) { return; }

		this.savePreferenceValues(record, key, type, show, status);
		this.saveActive(type, show, status);
	},

    restoreState: function() {
		var me = this,
			active = me.currentPreference.Active,
			type = active.get('type'),
			show = active.get('show'),
			available = me.currentPreference.Available,
			availableStatus,
			away = me.currentPreference.Away,
			awayStatus,
			dnd = me.currentPreference.DND,
			dndStatus;

		function update() {
			try {
				availableStatus = (available && !available.isFuture) ? available.get('status') : me.defaultStates.available;
				me.availableEl.down('.label').update(availableStatus);

				awayStatus = (away && !away.isFuture) ? away.get('status') : me.defaultStates.away;
				me.awayEl.down('.label').update(awayStatus);

				dndStatus = (dnd && !dnd.isFuture) ? dnd.get('status') : me.defaultStates.dnd;
				me.dndEl.down('.label').update(dndStatus);

				if (type === 'available') {
					me.availableEl[(show === 'chat') ? 'addCls' : 'removeCls']('selected');
					me.awayEl[(show === 'away') ? 'addCls' : 'removeCls']('selected');
					me.dndEl[(show === 'dnd') ? 'addCls' : 'removeCls']('selected');
					me.offlineEl.removeCls('selected');
				} else {
					me.offlineEl.addCls('selected');
				}
			} catch (e) {
				console.warn('Trouble in paradise. %o', e);
			}
		}

		if (me.rendered) {
			update();
		}else {
			me.on('afterrender', update, me);
		}
	},

    setPresence: function(username, presence) {
		if (!isMe(username) || !presence) {
			return;
		}

		var label,
			current = this.el.down('.selected'),
			show = presence.get('show'),
			name = presence.getName();

		if (current && name) {
			current.removeCls('selected');
		}

		if (presence.isOnline() && name) {
			name = this.el.down('.' + name);
			label = name && name.down('.label');

			if (!name) {
				console.log('Element did not exist');
			} else {
				name.addCls('selected');

				if (Ext.isEmpty(label.dom.innerHTML)) {
					label.update(presence.getDisplayText());
				}
			}
		} else if (this.offlineEl) {
			this.offlineEl.addCls('selected');
		}
	},

    setUpEditor: function() {
		this.editor = Ext.widget('presence-editor', {
			updateEl: true,
			renderTo: this.el.down('.list'),
			offsets: [26, 3],
			field: {
				type: 'textfield',
				emptyText: '',
				enforceMaxLength: true,
				maxLength: 140,
				allowEmpty: true,
				selectOnFocus: true
			},
			listeners: {
				canceledit: this.cancelEdit.bind(this),
				complete: this.saveEditor.bind(this)
			}
		});
	},

    getTarget: function(row) {
		if (row.is('.available')) {
			return 'available';
		}
		if (row.is('.away')) {
			return 'away';
		}
		if (row.is('.dnd')) {
			return 'dnd';
		}
		if (row.is('.offline')) {
			return 'unavailable';
		}

		return null;
	},

    clicked: function(e) {
		var show, status, type, presence;

		if (e.getTarget('.edit')) {
			e.stopEvent();
			this.startEditor(e);
			return;
		}

		if (e.getTarget('.available')) {
			status = e.getTarget('.available', 10, true).down('.label').dom.innerHTML;
			show = 'chat';
			type = 'available';
		} else if (e.getTarget('.away')) {
			status = e.getTarget('.away', 10, true).down('.label').dom.innerHTML;
			show = 'away';
			type = 'available';
		} else if (e.getTarget('.dnd')) {
			status = e.getTarget('.dnd', 10, true).down('.label').dom.innerHTML;
			show = 'dnd';
			type = 'available';
		} else if (e.getTarget('.offline')) {
			show = 'chat';
			type = 'unavailable';
		} else {
			console.log('unhandled click');
			return;
		}


		presence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username, type, show, status);

		if (this.isNewPresence(presence)) {
			this.ChatActions.changePresence(presence);

			this.saveActive(type, show, status, true);
		}

		this.deferHideParentMenusTimer = Ext.defer(this.deferHideParentMenus.bind(this), 250);
	},

    isNewPresence: function(updated) {
		var current = this.ChatStore.getPresenceOf($AppConfig.username);

		function compare(k) {
			return (updated && updated.get(k)) !== (current && current.get(k));
		}

		return compare('type') || compare('show') || compare('status');
	},

    isStatus: function(value) {
		var v = value && value.toLowerCase();

		return v && v !== 'available' && v !== 'away' && v !== 'do not disturb';
	},

    saveEditor: function(cmp, value, oldValue) {
		value = value.trim();

		if (value.length < 1) {
			value = oldValue;
		}

		var row = cmp.boundEl.up('.status'),
			target = this.getTarget(row),
			isNewPresence,
			type = (target === 'unavailable') ? 'unavailable' : 'available',
			show = (target === 'available') ? 'chat' : target,
			status = (this.isStatus(value)) ? value : '';

		newPresence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username, type, show, status);

		row.removeCls('active');

		if (value === oldValue) {
			row.down('.label').update(value);
			return;
		}

		if (this.isNewPresence(newPresence)) {
			this.ChatActions.changePresence(newPresence);
			this.savePreference(type, show, status, true);
		} else {
			this.setPresence($AppConfig.username, newPresence);
		}
	},

    startEditor: function(e) {
		var row = e.getTarget('.status', null, true),
			edit = row && row.down('.edit');

		if (edit) {
			row.addCls('active');
			this.editor.field.emptyText = edit.getAttribute('data-placeholder');
			this.editor.startEdit(row.down('.label'));
		}
	},

    cancelEdit: function(cmp, value, startValue) {
		var activeRow = cmp.boundEl.up('.status.active');

		if (activeRow) {
			activeRow.removeCls('active');
		}
	}
});
