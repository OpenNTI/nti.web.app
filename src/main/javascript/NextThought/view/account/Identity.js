//SCSS defined _identity.scss
Ext.define('NextThought.view.account.Identity',{
	extend: 'Ext.Component',
	alias: 'widget.identity',

	cls: 'identity',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'img', src: '{avatarURL}', cls: 'avatar'},
		{
			cls: 'wrap',
			cn: [{
				cls: 'name', html: '{realname:ellipsis(30)}'
			},{
				cls: 'status', html: '{status}'
			}]
		}
	]),

	renderSelectors: {
		notificationCount: 'span.notifications',
		name: 'div.name',
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
	}
});
