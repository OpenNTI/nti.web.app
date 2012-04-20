Ext.define('NextThought.view.widgets.chat.FriendEntry', {
	extend: 'Ext.Component',
	alias: 'widget.chat-friend-entry',

	mixins: {
		avatar: 'NextThought.mixins.Avatar'
	},

	renderTpl: new Ext.XTemplate(
		'<div class="x-chat-friend-entry">',
			'{[this.applySubtemplate("Avatar",values)]}',
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
		name: '.x-chat-friend-entry span.name'
	},


	initComponent: function(){
		this.addEvents('click');
		this.callParent(arguments);

		this.initAvatar(this.user,16);
		this.update(this.user);

		this.renderData.cls = this.cls || '';
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
		this.fireEvent('shadow', this, this.user);
	},

	update: function(user){
		this.user = user;

		if (this.rendered){
			this.name.update( user.getName() );
		}
		else {
			this.renderData.user = user;
			this.renderData.name = user.getName();
		}

		//updates the name
		user.on('changed', this.update, this, {single: true});
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
