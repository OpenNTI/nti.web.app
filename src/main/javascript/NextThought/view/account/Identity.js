//SCSS defined _identity.scss
Ext.define('NextThought.view.account.Identity',{
	extend: 'Ext.Component',
	alias: 'widget.identity',

    requires: [
        'NextThought.view.menus.Settings'
    ],

	cls: 'identity',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'img', src: '{avatarURL}', cls: 'avatar'},
        { tag: 'div', cls: 'menu', 'data-qtip': 'Settings'},
		{
			cls: 'wrap',
			cn: [{
				cls: 'name', html: '{displayName}'
			},{
				cls: 'status', html: '{status}'
			}]
		}
	]),

	renderSelectors: {
		notificationCount: 'span.notifications',
		name: 'div.name',
        menuBtn: 'div.menu',
		status: 'div.status',
		avatar: 'img.avatar'
	},

	initComponent: function(){
		var me = this;

		me.callParent(arguments);

		me.renderData = Ext.apply(me.renderData||{}, $AppConfig.userObject.data);

		this.menu = Ext.widget('settings-menu');

		this.mon($AppConfig.userObject,{
			scope: this,
			'changed': function(r){
				this.name.update(r.getName());
				this.status.update(r.get('status'));
				this.avatar.set({src:r.get('avatarURL')});
			}
		});


	},


    afterRender: function(){
		var me = this;
        me.callParent(arguments);
        me.mon(me.menuBtn, 'click', function(){
            me.menu.showBy(me.menuBtn);
        });
    }
});
