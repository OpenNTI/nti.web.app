Ext.define('NextThought.view.widgets.chat.FriendEntry', {
	extend: 'Ext.Component',
	alias: 'widget.chat-friend-entry',

	renderTpl: new Ext.XTemplate(
		'<div class="x-chat-friend-entry {Presence} {cls}">',
			'<img src="{avatarURL}" width=16 height=16"/>',
			'<div>',
				'<span class="name">{name}</span> ',
			'</div>',
		'</div>',
		{
			compiled: true,
			disableFormats: true
		}),

	renderSelectors: {
		box: 'div.x-chat-friend-entry',
		name: '.x-chat-friend-entry span.name',
		icon: 'img'
	},

	initComponent: function(){
		this.addEvents('click');
		this.callParent(arguments);

		this.update(this.user);

		this.renderData.cls = this.cls || '';
	},

	render: function() {
		this.callParent(arguments);


	},

	afterRender: function() {
		var me = this;
		me.callParent(arguments);
		me.initializeDropZone(me);

		if (this.noMenu) {
			me.box.on('click', function(){
				//if(!/offline/i.test(me.user.get('Presence')))
				me.fireEvent('click', me.user);
			});
		}

		this.setupMenu();
	},

	setupMenu: function() {
		//Only do this the entry is not me
		if ($AppConfig.userObject.getId() === this.user.getId() || this.noMenu){return;}

		this.menu = Ext.create('Ext.menu.Menu', {items: this.buildMenu()});

		this.menu.on({
			mouseleave: this.hideMenu,
			mouseover: this.showMenu,
			scope: this
		});

		this.el.on({
			mouseleave: this.hideMenu,
			mousemove: this.showMenu,
			mouseover: this.showMenu,
			click: this.showMenu,
			scope: this
		});
	},

	buildMenu: function(){
		var m =  [];

		if (this.isModerator) {
			m.push({
				text: 'Shadow',
				iconCls: 'shadow-menu',
				scope: this,
				handler: this.shadow
			});
		}

		m.push({
				text: 'Chat',
				iconCls: 'chat-menu',
				scope: this,
				handler: this.chat
			});

		return m;
	},

	chat: function(){
		this.fireEvent('click', this.user);
	},

	shadow: function(){
		this.fireEvent('shadow', this.roomId, this.user);
	},

	update: function(user){
		this.user = user;
		var status = user.get('Presence') || 'offline';

		if (this.rendered){
			this.box.removeCls('offline online');
			this.box.addCls(status.toLowerCase());
			this.icon.set({src: user.get('avatarURL')});
			this.name.update( user.get('alias')||u.get('realname') );
		}
		else {
			this.renderData.Presence = status.toLowerCase();
			this.renderData.avatarURL = user.get('avatarURL');
			this.renderData.name = user.get('alias')||user.get('realname');
		}

		user.on('changed', this.update, this);
	},

	hideMenu: function(){
		var m = this.menu;
		this.hideMenuTimout = setTimeout(function(){m.hide();},100);
	},

	showMenu: function(){
		clearTimeout(this.hideMenuTimout);
		this.menu.showBy(this.el, 'tr-br?');
	},

	initializeDropZone: function(v) {
		v.dropZone = Ext.create('Ext.dd.DropZone', v.box, {

			getTargetFromEvent: function(e) {
				return v.box.dom;
			},
			onNodeEnter : function(target, dd, e, data){
				Ext.select('.drag-hover').removeCls('drag-hover');
				Ext.fly(target).addCls('drag-hover');
			},
			onNodeOut : function(target, dd, e, data){
				Ext.fly(target).removeCls('drag-hover');
			},
			onNodeOver : function(target, dd, e, data){
				return Ext.dd.DropZone.prototype.dropAllowed;
			},

			onNodeDrop : function(target, dd, e, data){
				return v.fireEvent('messages-dropped', v.user, data);
			}
		});
	}
});
