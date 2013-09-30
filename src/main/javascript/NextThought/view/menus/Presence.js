//styles in _identity.scss
Ext.define('NextThought.view.menus.Presence', {
	extend: 'Ext.Component',
	alias:  'widget.presence-menu',

	requires: [
		'NextThought.view.menus.PresenceEditor',
		'NextThought.cache.AbstractStorage'
	],

	cls:        'presence-menu',
	ui:         'presence-menu',
	sessionKey: 'presence-state',

	renderTpl: Ext.DomHelper.markup([
										{cls: 'header', html: 'MY STATUS'},
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
		'availableEl': '.list .available',
		'awayEl':      '.list .away',
		'dndEl':       '.list .dnd',
		'offlineEl':   '.list .offline'
	},

	defaultStates: {
		'available': 'Available',
		'away':      'Away',
		'dnd':       'Do not disturb',
		'offline':   'Offline'
	},

	currentPreference: {},

	initComponent: function () {
		this.callParent(arguments);
	},

	beforeRender: function () {
		var me = this;
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			states: [
				{state: 'available', label: 'Available', editable: true},
				{state: 'away', label: 'Away', editable: true},
				{state: 'dnd', label: 'Do not disturb', editable: true},
				//{state: 'invisible', label: 'Invisible'},
				{state: 'offline', label: 'Offline'}
			]
		});
		$AppConfig.Preferences.getPreference('ChatPresence', function(value){
			if(value){
				me.currentPreference.Active = value.get('Active');
				me.currentPreference.Available = value.get('Available');
				me.currentPreference.Away = value.get('Away');
				me.currentPreference.DND = value.get('DND');

				me.restoreState();
			}else{
				console.log('No ChatPresence preference returned');
			}
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		var presence = Ext.getStore('PresenceInfo').getPresenceOf($AppConfig.username);

		this.setPresence($AppConfig.username, presence);

		this.setUpEditor();
		this.mon(this.el, 'click', 'clicked', this);

		this.mon(Ext.getStore('PresenceInfo'), 'presence-changed', 'setPresence', this);
	},


	onDestroy: function () {
		//this.cancelDeferHide();
		clearTimeout(this.deferHideParentMenusTimer);
		this.callParent(arguments);
	},


	deferHideParentMenus: function () {
		Ext.menu.Manager.hideAll();
	},

	updatePreference: function(record, type, show, status){
		record.set('type', type);
		record.set('show', show);
		record.set('status', status);
		record.save();
	},

	savePreferenceValues: function(record, key, type, show, status){
		var me = this;

		if(record.isFuture){
			$AppConfig.Preferences.getPreference(key, function(value){
				if(value){
					me.updatePreference(value, type, show, status);
				}
			});
		}else{
			me.updatePreference(record, type, show, status);
		}
	},

	saveActive: function(type, show, status){
		this.savePreferenceValues(this.currentPreference.Active, 'ChatPresence/Active', type, show, status);
	},

	savePreference: function(type, show, status){
		var record, key;


		if(show === 'chat'){
			record = this.currentPreference.Available;
			key = 'ChatPresence/Available';
			status = (Ext.isEmpty(status))? this.defaultStates.available : status;
		}else if(show === 'away'){
			record = this.currentPreference.Away;
			key = 'ChatPresence/Away';
			status = (Ext.isEmpty(status))? this.defaultStates.away : status;
		}else if(show === 'dnd'){
			record = this.currentPreference.DND;
			key = 'ChatPresence/DND';
			status = (Ext.isEmpty(status))? this.defaultStates.dnd : status;
		}

		if(!record || !key){ return; }

		this.savePreferenceValues(record, key, type, show, status);
		this.saveActive(type, show, status); 
	},

	restoreState: function () {
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

		function update(){

			availableStatus = (available && !available.isFuture)? available.get('status') : me.defaultStates.available;
			me.availableEl.down('.label').update(availableStatus);

			awayStatus = (away && !away.isFuture)? away.get('status') : me.defaultStates.away;
			me.awayEl.down('.label').update(awayStatus);

			dndStatus = (dnd && !dnd.isFuture)?  dnd.get('status') : me.defaultStates.dnd;
			me.dndEl.down('.label').update(dndStatus);

			if(type === 'available'){
				me.availableEl[( show === 'chat' )? 'addCls' : 'removeCls']('selected');
				me.awayEl[( show === 'away' )? 'addCls' : 'removeCls']('selected');
				me.dndEl[( show === 'dnd')? 'addCls' : 'removeCls']('selected');
				me.offlineEl.removeCls('selected');
			}else{
				me.offlineEl.addCls('selected');
			}
		}

		if(me.rendered){
			update();
		}else{
			me.on('afterrender', update, me);
		}
	},


	setPresence: function (username, presence) {
		if (!isMe(username) || !presence) {
			return;
		}

		var label, current = this.el.down('.selected'),
				show = presence.get('show'),
				name = presence.getName();

		if (current && name) {
			current.removeCls('selected');
		}

		if (presence.isOnline() && name) {
			name = this.el.down('.' + name);
			label = name.down('.label');
			if (!name) {
				console.log('Element didnt exist');
			} else {
				name.addCls('selected');
				console.log(presence.getDisplayText());
				if (Ext.isEmpty(label.dom.innerHTML)) {
					label.update(presence.getDisplayText());
				}
			}
		} else if (this.offlineEl) {
			this.offlineEl.addCls('selected');
		}

	},

	setUpEditor: function () {
		this.editor = Ext.widget('presence-editor', {
			updateEl:  true,
			renderTo:  this.el.down('.list'),
			offsets:   [26, 3],
			field:     {
				xtype:            'textfield',
				emptyText:        '',
				enforceMaxLength: true,
				maxLength:        140,
				allowEmpty:       true,
				selectOnFocus:    true
			},
			listeners: {
				canceledit: 'cancelEdit',
				complete:   'saveEditor',
				scope:      this
			}
		});
	},

	getTarget: function (row) {
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

	clicked: function (e) {
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
			console.log("unhandled click");
			return;
		}

		presence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username, type, show, status);

		if (this.isNewPresence(presence)) {
			this.fireEvent('set-chat-presence', presence);
			this.saveActive(type, show, status, true);
		}

		this.deferHideParentMenusTimer = Ext.defer(this.deferHideParentMenus, 250, this);
	},

	isNewPresence: function (newPresence) {
		var currentPresence = Ext.getStore('PresenceInfo').getPresenceOf($AppConfig.username);

		return newPresence.get('type') !== currentPresence.get('type') || newPresence.get('show') !== currentPresence.get('show') || newPresence.get('status') !== currentPresence.get('status');
	},

	isStatus: function (value) {
		var v = value && value.toLowerCase();

		return v && v !== 'available' && v !== 'away' && v !== 'do not disturb';
	},

	saveEditor: function (cmp, value, oldValue) {
		var row = cmp.boundEl.up('.status'),
				target = this.getTarget(row),
				newPresence,
				type = (target === 'unavailable') ? 'unavailable' : 'available',
				show = (target === 'available') ? 'chat' : target,
				status = (this.isStatus(value)) ? value : '';

		newPresence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username, type, show, status);

		row.removeCls('active');

		if (value === oldValue) {
			return;
		}

		if (this.isNewPresence(newPresence)) {
			//somethings different update the presence
			console.log(newPresence);
			this.fireEvent('set-chat-presence', newPresence);
			this.savePreference(type, show, status, true);
		} else {
			this.setPresence($AppConfig.username, newPresence);
			console.log("No presence change");
		}
	},

	startEditor: function (e) {
		var row = e.getTarget('.status', null, true),
				edit = row && row.down('.edit');

		if (edit) {
			row.addCls('active');
			this.editor.field.emptyText = edit.getAttribute('data-placeholder');
			this.editor.startEdit(row.down('.label'));
		}
	},


	cancelEdit: function (cmp, value, startValue) {
		var activeRow = cmp.boundEl.up('.status.active');
		if (activeRow) {
			activeRow.removeCls('active');
		}
	}
});
