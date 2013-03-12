Ext.define('NextThought.view.account.activity.Popout',{
	extend: 'Ext.container.Container',
	alias: 'widget.activity-popout',

	requires: [
		'NextThought.view.account.contacts.management.Person',
		'NextThought.view.account.activity.Preview',
		'NextThought.view.account.activity.BlogPreview',
		'NextThought.view.account.activity.BlogCommentPreview'
	],

	floating: true,

	width: 400,
	cls: 'activity-popout',
	hideMode: 'visibility',


	constructor: function(config){
		var isContact = Ext.getStore('FriendsList').isContact(config.user),
			type = 'activity-preview',
			className = config.record.get('Class');
			alias = "widget.activity-preview-"+className;

		if(!Ext.isEmpty(Ext.ClassManager.getNameByAlias(alias))){
			type = 'activity-preview-'+className;
		}

		this.addItems(config, type, isContact);
		return this.callParent(arguments);
	},

	addItems: function(config, type, isContact){
		this.items = [{
			xtype: 'person-card',
			hideGroups: true,
			user: config.user,
			isContact: isContact
		}, {
			xtype: type,
			record: config.record,
			user: config.user
		} ];
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
		if(!e.getTarget('.'+this.cls) && !e.getTarget('#'+this.refEl.id) && !e.getTarget('.x-menu')){
			clearTimeout(this.hideTimer);
			this.hideTimer = Ext.defer(function(){this.fireEvent('blur');},500,this);
		}
		else {
			clearTimeout(this.hideTimer);
		}
	},



	inheritableStatics: {

		popup: function(record, alignmentEl, el, offsets, flipFactor, viewRef){
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
					alignment = 'tr-tl?',
					play = Ext.dom.Element.getViewportHeight() - Ext.fly(el).getTop();

                pop.show().hide();

                if(viewRef) {
                    pop.mon( pop.getEl(), 'mouseover', function(){
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
			},this);
		}

	}
});
