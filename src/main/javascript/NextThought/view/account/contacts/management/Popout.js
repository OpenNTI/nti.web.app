Ext.define('NextThought.view.account.contacts.management.Popout',{
	extend: 'Ext.container.Container',
	alias: 'widget.contact-popout',

	requires: [
		'NextThought.view.account.contacts.management.Person'
	],

	floating: true,

	width: 255,
	cls: 'contact-popout',
	hideMode: 'visibility',

	items: [
		{xtype: 'person-card'},
		{
			xtype: 'container',
			cls: 'add-button',
			layout: 'fit',
			items: [{
				xtype: 'button',
				ui: 'primary',
				text: 'Add to Contacts',
				scale: 'large',
				handler: function(btn){
					btn.up('.contact-popout').actOnContact();
				}
			}]
		}
	],

	constructor: function(config){
		this.buttonEvent = 'add-contact';
		var isContact = Ext.getStore('FriendsList').isContact(config.record);
		this.items = Ext.clone(this.items);

		Ext.apply(this.items[0],{
			user: config.record,
			isContact: isContact
		});

		if(isContact){
			this.buttonEvent = 'delete-contact';
			Ext.apply(this.items[1].items[0],{
				ui: 'caution',
				text: 'Remove Contact'
			});
		}


//		this.startChatAction = new Ext.Action({
//			text: 'Start a Chat',
//			scope: this,
//			handler: this.startChat,
//			itemId: 'start-chat',
//			ui: 'nt-menuitem', plain: true,
//			hidden: !$AppConfig.service.canChat(),
//			disabled: this.user.get('Presence')==='Offline'
//		});

		return this.callParent(arguments);
	},


	destroy: function(e){
		this.callParent(arguments);
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		me.mon(me.el,'click',function(e){e.stopPropagation();},me);

		me.on('blur',me.destroy,me);

		Ext.defer(function(){
			me.mon(me.el.up('body'),{
				scope: me,
				'click':me.detectBlur,
				'mouseover':me.detectBlur
			});
		},1);
	},


	detectBlur: function(e){
		if(!e.getTarget('.'+this.cls) && !e.getTarget('#'+this.refEl.id) && !e.getTarget('.x-mask')){
			clearTimeout(this.hideTimer);
			this.hideTimer = Ext.defer(function(){this.fireEvent('blur', e);},500,this);
		}
		else {
			clearTimeout(this.hideTimer);
		}
	},



	actOnContact: function(){
		var data = this.down('person-card').getSelected();
		this.fireEvent(this.buttonEvent, data.user, data.groups);
		this.destroy();
	},


	statics: {

		popup: function(record, alignmentEl, el, offsets, flipFactor, viewRef){
			var pop,
				alignment = 'tr-tl?',
				play = Ext.dom.Element.getViewportHeight() - Ext.fly(el).getTop(),
				id = record.getId(),
				open = false;

			offsets = offsets || [0,0];

			Ext.each(Ext.ComponentQuery.query('activity-popout,contact-popout'),function(o){
				if(o.record.getId()!==id || record.modelName !== o.record.modelName){ o.destroy(); }
				else { open = true; }
			});

			if(open){return;}

			pop = this.create({record: record, refEl: Ext.get(el)});


			pop.show().hide();

            if(viewRef) {
                pop.mon(pop.getEl(), 'mouseover', function(){
                    viewRef.cancelPopupTimeout();
                });
            }

			if( pop.getHeight() > play ){
				pop.addCls('bottom-aligned');
				alignment = 'br-bl?';
				offsets[1] = Math.floor((flipFactor||-1)*offsets[1]);
			}

			pop.show();
			pop.alignTo(alignmentEl,alignment,offsets);
		}

	}
});
