Ext.define('NextThought.view.profiles.outline.View',{
	extend: 'Ext.Component',
	alias: 'widget.profile-outline',

	//<editor-fold desc="Config">

	ui: 'profile',
	cls: 'outline',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'avatar', style:{ backgroundImage: 'url({avatarURL})' }, cn: [
			{ cls:'name {presence}', html:'{displayName}' }
		]},
		{
			cls: 'controls',
			cn: [
				{ cls: 'lists' },
				{ cls: 'settings' },
				{ tag:'tpl', 'if':'isMe', cn: { cls: 'button edit', html:'Edit' }},
				{ tag:'tpl', 'if':'!isMe', cn: [
					{ tag:'tpl', 'if':'isContact', cn: { cls: 'button chat disabled', html:'Chat' }},
					{ tag:'tpl', 'if':'!isContact', cn: { cls: 'button', html:'Add Contact' }}
				]}
			]
		},
		{
			cls: 'nav'
		}
	]),

	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.name',
		controlsEl: '.controls'
	},

	//</editor-fold>


	//<editor-fold desc="Init & Render">
	initComponent: function(){
		this.callParent(arguments);
		this.monitorUser(this.user);

		this.groupsListMenu = Ext.widget({
			xtype: 'menu',
			ui: 'nt',
			plain: true,
			shadow: false,
			width: 255,
			items: [{xtype:'management-group-list', allowSelect: true}]
		});
		this.on('destroy','destroy',this.groupsListMenu);

		this.groupsList = this.groupsListMenu.down('management-group-list');
		this.mon(this.groupsList, 'added-contact', 'convertToContact');

		this.on({
			avatarEl:{click:'onControlsClicked'},
			controlsEl:{click:'onControlsClicked'},
			nameEl:{click:'onNameClicked'}
		});
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.applyRenderData(this.user);
	},


	afterRender: function(){
		this.callParent(arguments);

		if(isMe(this.user) || !$AppConfig.service.canFriend()){
			this.controlsEl.select('.lists,.settings').addCls('disabled');
			if($AppConfig.disableProfiles === true){
				this.controlsEl.down('.button').hide();
			}
		}
		if(!$AppConfig.service.canChat()){
			this.controlsEl.down('.button').destroy();
		}

		this.updateButton();

		var store = new Ext.data.Store({
			fields: [
				{name: 'id', type: 'string'},
				{name: 'label', type: 'string'},
				{name: 'count', type: 'int', defaultValue: 0},
				{name: 'type', type: 'string', defaultValue: 'view'},//or filter
				{name: 'mapping', type: 'string'}
			],
			data: [
				{id:'about', label:'About', mapping:'profile-about' },
				{id:'activity', label:'Recent Activity', mapping:'profile-activity' },
				{id:'blog', label:'Thoughts', mapping:'profile-blog' }/*,
				{id:'discussions', label:'Discussions', type:'filter', mapping:'profile-activity' },
				{id:'chats', label:'Chats', type:'filter', mapping:'profile-activity' },
				{id:'comments', label:'Comments', type:'filter', mapping:'profile-activity' },
				{id:'highlights', label:'Highlights', type:'filter', mapping:'profile-activity' },
				{id:'bookmarks', label:'Bookmarks', type:'filter', mapping:'profile-activity' },
				{id:'like', label:'Likes', type:'filter', mapping:'profile-activity' }*/
			]
		});

		this.navStore = store;
		this.nav = Ext.widget({
			xtype: 'dataview',
			ui: 'nav',
			preserveScrollOnRefresh: true,
			overItemCls: 'over',
			itemSelector: '.outline-row',
			store: store,
			cls: 'nav-outline make-white',
			renderTo: this.el.down('.nav'),
			selModel: {
				allowDeselect: false,
				toggleOnClick: false,
				deselectOnContainerClick: false
			},
			tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
				{
					cls: 'outline-row',
					cn:  [
						{ tag:'tpl', 'if':'count', cn:{ cls: 'count', html:'{count}' } },
						{ cls: 'label', html: '{label}' }
					]
				}
			]}),
			listeners: {
				scope: this,
				select: 'selectionChanged'
			}
		});
		this.on('destroy','destroy',this.nav);
	},


	applyRenderData: function(user){
		var m;
		this.isMe = isMe(user);
		this.isContact = Ext.getStore('FriendsList').isContact(this.user);
		this.groupsList.setUser(user).isContact = this.isContact;

		Ext.destroy(this.optionsMenu);
		m = this.optionsMenu = Ext.widget({xtype:'person-options-menu', width:255, ownerCmp: this, user: this.user, isContact: this.isContact });
		m.mon(this,'destroy','destroy');
		m.on('hide-menu','hide');
		this.mon(m, 'remove-contact-selected', 'onDeleteContact');


		this.renderData = Ext.apply(this.renderData||{},user.getData());
		Ext.apply(this.renderData,{
			isMe: this.isMe,
			isContact: this.isContact,
			presence: user.getPresence().getName() + (this.isContact||this.isMe ? '' : ' no-presence')
		});
	},
	//</editor-fold>


	//<editor-fold desc="Handlers">

	monitorUser: function (u) {
		var me = this,
			m = {
				destroyable: true,
				scope: this,
				changed: function (r) {
					me.applyRenderData(r);
					if( me.rendered){
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

		if (me.nameEl && me.user) {
			me.nameEl.set({cls:'name '+me.user.getPresence().getName()+(this.isContact||this.isMe ? '' : ' no-presence')});
			me.updateButton();
		}
	},


	onControlsClicked: function(e){
		e.stopEvent();
		if(e.getTarget('.disabled')){
			return;
		}

		if(e.getTarget('.settings')){
			this.optionsMenu.showBy(this.avatarEl,'tl-bl');
		}
		else if(e.getTarget('.lists')){
			this.groupsListMenu.showBy(this.avatarEl,'tl-bl');
		}
		else if(e.getTarget('.avatar')){
			if(this.hasCls('editing')){
				this.fireEvent('edit');
			}
		}
		//the various states of the action button (default, edit, and chat)
		else if(e.getTarget('.button.edit')){
			this.enableEditing();
		}
		else if(e.getTarget('.button.editing')){
			this.enableEditing(false);
		}
		else if(e.getTarget('.button.chat')){
			this.fireEvent('chat', this.user);
		}
		else if(e.getTarget('.button')) {
			this.onAddContact();
		}

	},


	onNameClicked: function(e){
		var t = e.getTarget('.name');
		e.stopEvent();
		if( t ) {
			this.fireEvent('name-clicked', t, this, this.username, this.user);
		}
	},


	onAddContact: function(){
		var me = this,
			data = this.getSelected(),
			fin = function(){
				me.convertToContact();
			};

		this.fireEvent('add-contact', this.user, data.groups, fin);
	},


	onDeleteContact: function(){
		var me = this,
			data = this.getSelected(),
			fin = function(){ me.convertToStranger(); };

		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		alert({
			msg: 'The following action will remove this contact.',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function(str){
				if(str === 'ok'){
					me.fireEvent('delete-contact', me.user, data.groups, fin);
				}
			}
		});

	},


	selectionChanged: function(sel,rec){
		var d = (rec && rec.getData()) ||{};

		this.fireEvent('show-profile-view', d.mapping, d.type, d.id);
	},


	updateSelection: function(active, fromUser){
		var view = active.xtype || active,
			i = this.navStore.findBy(function(r){
				return r.get('type')==='view' && r.get('mapping') === view;
			});

		if( this.hasCls('editing') ) {
			this.enableEditing(false);
		}
		this.nav.getSelectionModel().select(i, false, fromUser!==true);

	},
	//</editor-fold>


	//<editor-fold desc="UI Manipulations">
	updateAvatar: function(user){
		var HOST = Globals.HOST_PREFIX_PATTERN,
			avatarURL = user.get('avatarURL'),
			currentURL = this.avatarEl.getStyle('background-image').slice(4, -1), a, b, d;

		if(avatarURL && avatarURL.indexOf('//') === 0){
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
		}
	},


	convertToContact: function(){
		this.controlsEl.down('.button').set({cls:'button chat disabled'}).update('Chat');
		this.isContact = true;
		this.applyRenderData(this.user);
		this.nameEl.removeCls('no-presence');
		this.updateButton();
	},


	convertToStranger: function(){
		this.controlsEl.down('.button').set({cls:'button'}).update('Add Contact');
		this.isContact = false;
		this.applyRenderData(this.user);
		this.nameEl.addCls('no-presence');
		this.updateButton();
	},


	enableEditing: function(enable){
		enable = enable!==false;

		var event = (enable ? 'en':'dis') + 'able-edit',
			mask = (enable?'':'un')+'mask',
			cls = (enable? 'add':'remove')+'Cls',
			ucls = (enable? 'remove':'add')+'Cls',
			label = enable ? 'Done' : 'Edit',
			button = this.controlsEl.down('.button');

		if(enable){
			this.updateSelection('profile-about',true);//make sure you are on the about panel
		}

		this.nav[mask]();
		this.fireEvent(event);
		this[cls]('editing');
		button.update(label)[ucls]('edit')[cls]('editing');
	},


	updateButton: function(){
		var b = this.controlsEl.down('.button'),
			pi = this.user.getPresence(),
			current = $AppConfig.userObject.getPresence(),
			isOnline = current && current.isOnline() && ((pi && pi.isOnline()) || this.isUserOnline());
		if( b ){
			b[(this.isContact && !isOnline)?'addCls':'removeCls']('disabled');
		}
	},
	//</editor-fold>


	//<editor-fold desc="Methods">
	isUserOnline: function(){
		var o = Ext.getStore('online-contacts-store'), k = 'Username';
		return Boolean(o.findRecord(k, this.user.get(k)));
	},


	getSelected: function(){
		var l = this.groupsList;
		return {
			user: this.user.getId(),
			groups: l? l.getSelected() : []
		};
	},


	removeNavigationItem: function(navMapping) {
		var toRemove = [];
		if(!this.navStore){
			return;
		}
		this.navStore.each(function(r){
			if(r.get('mapping')===navMapping){
				toRemove.push(r);
			}
		});

		if(Ext.isEmpty(toRemove)){
			console.warn('Did not remove any nodes, no mapping "',navMapping,'" found');
			return;
		}

		this.navStore.remove(toRemove);
	}
	//</editor-fold>
});
