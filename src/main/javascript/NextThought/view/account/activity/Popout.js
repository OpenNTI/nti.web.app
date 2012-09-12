Ext.define('NextThought.view.account.activity.Popout',{
	extend: 'Ext.container.Container',
	alias: 'widget.activity-popout',

	requires: [
		'NextThought.view.account.contacts.management.Person'
	],

	floating: true,

	width: 255,
	cls: 'activity-popout',
	hideMode: 'visibility',


	constructor: function(config){
		var isContact = Ext.getStore('FriendsList').isContact(config.user);
		this.items = [
			{
				xtype: 'person-card',
				hideGroups: true,
				user: config.user,
				isContact: isContact
			},{
				xtype: 'container',
				cls: 'reply-options',
				layout: 'fit',
				items: [{
				}]
			}];


		if(isContact){
			this.buttonEvent = 'delete-contact';
			Ext.apply(this.items[1].items[0],{
				ui: 'secondary',
				text: 'Remove Contact'
			});
		}

		return this.callParent(arguments);
	},


	destroy: function(){
		Ext.getBody().un('click',this.detectBlur,this);
		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click',function(e){e.stopPropagation();},this);
		this.on('blur',this.destroy,this);
		Ext.defer(function(){Ext.getBody().on('click',this.detectBlur,this);},1,this);
	},


	detectBlur: function(e){
		if(!e.getTarget('.activity-popout')){
			this.fireEvent('blur');
		}
	},



	statics: {

		popup: function(record, el){
			var id = record.getId(), open = false;
			Ext.each(Ext.ComponentQuery.query('activity-popout,contact-popout'),function(o){
				if(o.record.getId()!==id || record.modelName !== o.record.modelName){
					o.destroy();
				}
				else {
					open = true;
				}
			});

			if(open){return;}

			UserRepository.getUser(record.get('Creator'),function(user){
			var pop = this.create({record: record, user: user}),
				alignment = 'tr-tl',
				offsets = [-10,-25],
				play = Ext.dom.Element.getViewportHeight() - el.getTop();

			if(pop.isDestroyed){return;}

			pop.show().hide();

			if( pop.getHeight() > play ){
				pop.addCls('bottom-aligned');
				alignment = 'br-bl';
				offsets[1] = -offsets[1];
			}

			pop.show();
			pop.alignTo(el,alignment,offsets);
			},this);
		}

	}
});
