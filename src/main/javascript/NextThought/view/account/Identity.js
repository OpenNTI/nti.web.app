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
        { tag: 'div', class: 'menu'},
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
        menu: 'div.menu',
		status: 'div.status'
	},

	initComponent: function(){
		var me = this, t;

		me.callParent(arguments);

		me.renderData = Ext.apply(me.renderData||{}, $AppConfig.userObject.data);

		this.mon($AppConfig.userObject,{
			scope: this,
			'changed': function(r){
				this.name.update(r.getName());
				this.status.update(r.get('status'));
			}
		});


	},


    afterRender: function(){
        this.callParent(arguments);
        this.mon(this.menu, 'click', function(){
            Ext.widget('settings-menu',{}).showBy(this);
        });
    }
});
