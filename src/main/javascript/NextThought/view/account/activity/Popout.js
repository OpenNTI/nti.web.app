Ext.define('NextThought.view.account.activity.Popout',{
	extend: 'Ext.container.Container',
	alias: 'widget.activity-popout',

	requires: [
		'NextThought.view.account.contacts.management.Person',
		'NextThought.view.account.activity.Preview'
	],

	floating: true,

	width: 255,
	cls: 'activity-popout',
	hideMode: 'visibility',


	constructor: function(config){
		var isContact = Ext.getStore('FriendsList').isContact(config.user);
		this.items = [ {
			xtype: 'person-card',
			hideGroups: true,
			user: config.user,
			isContact: isContact
		}, {
			xtype: 'activity-preview',
			record: config.record,
			user: config.user
		} ];
		return this.callParent(arguments);
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		me.mon(me.el,'click',function(e){e.stopPropagation();},me);

		me.on('blur',me.destroy,me);

		Ext.defer(function(){
			me.mon(Ext.fly(window),{
				scope: me,
				'click':me.detectBlur,
				'mouseover':me.detectBlur
			});
		},1);
	},


	detectBlur: function(e){
		if(!e.getTarget('.'+this.cls) && !e.getTarget('#'+this.refEl.id)){
			this.hideTimer = Ext.defer(function(){this.fireEvent('blur');},500,this);
		}
		else {
			clearTimeout(this.hideTimer);
		}
	},



	statics: {

		popup: function(record, el, offsets, flipFactor){
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

			offsets = offsets||[0,0];

			UserRepository.getUser(record.get('Creator'),function(user){
				var pop = this.create({record: record, user: user, refEl: Ext.get(el)}),
					alignment = 'tr-tl',
					play = Ext.dom.Element.getViewportHeight() - Ext.fly(el).getTop();

				if(pop.isDestroyed){return;}

				pop.show().hide();

				if( pop.getHeight() > play ){
					pop.addCls('bottom-aligned');
					alignment = 'br-bl';
					offsets[1] = Math.floor((flipFactor||-1)*offsets[1]);
				}

				pop.show();
				pop.alignTo(el,alignment,offsets);
			},this);
		}

	}
});
