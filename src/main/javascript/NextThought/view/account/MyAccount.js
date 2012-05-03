Ext.define('NextThought.view.account.MyAccount',{
	extend: 'Ext.Component',
	alias: 'widget.my-account',
	requires: [
		'NextThought.view.menus.MyAccount'
	],

	renderTpl: [
		'<div class="my-account-wrapper">',
			'<div class="settings menu-nib"></div>',
			'<div class="name">{name}<span class="notifications">{notification-count}</span></div>',
			'<div class="status">{status}</div>',
		'</div>'
	],

	renderSelectors: {
		boxEl: 'div.my-account-wrapper'
	},

	initComponent: function(){
		var me = this, cls = 'menu-visible',t;
		me.callParent(arguments);
		me.renderData = Ext.apply(me.renderData||{},{
			name: $AppConfig.userObject.getName(),
			'notification-count': 7,
			status: 'Reading Prime Factorization'
		});
		me.menu = Ext.widget({xtype: 'my-account-menu', xhooks:{
			hide: function(){ this.callParent(arguments); clearTimeout(t); me.getEl().removeCls(cls);},
			show: function(){ this.callParent(arguments); t=setTimeout(function(){me.getEl().addCls(cls);},600);}
		}});
	},

	afterRender: function(){
		this.callParent(arguments);
		this.getEl().addCls(Ext.baseCSSPrefix + 'menu');//make clicks on this not hide the menu
		this.getEl().on({
			scope: this,
			click: this.showMenu
		})
	},

	showMenu: function(e){
		e.stopPropagation();
		e.preventDefault();

		if(!this.menu.isVisible()){
			this.menu.showBy(this.boxEl,'tl-bl?',[0,-1]);
		}
		else {
			this.menu.hide();
		}

		//IE needs this
		return false;
	}
});
