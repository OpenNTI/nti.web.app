Ext.define('NextThought.view.contacts.Card',{
	extend: 'Ext.Component',
	alias: 'widget.contacts-tabs-card',
	mixins: {
		profileLink: 'NextThought.mixins.ProfileLinks',
		chatLink: 'NextThought.mixins.ChatLinks'
	},

	ui: 'contacts-tabs-card',
	cls: 'contact-card-container',

	renderTpl: Ext.DomHelper.markup({
		cls: 'contact-card',
		cn: [{
			cls: 'avatar', style: {backgroundImage: 'url({avatarURL});'}
		},{
			cls: 'meta',
			cn: [
				{ cls: 'name', html: '{name}', 'data-field':'name'},
				{ cls: 'add-to-contacts', html: 'ADD'},
				{ tag: 'tpl', 'if':'!hideProfile && email', cn:[
					{ cls: 'email', html: '{email}', 'data-field':'email' }]},

				{ tag: 'tpl', 'if':'!hideProfile && (role || affiliation)', cn:[
					{ cls: 'composite-line', cn: [
						{ tag: 'tpl',  'if': 'role', cn:[
							{ tag: 'span', html:'{role}', 'data-field':'role'}]},
						{ tag: 'tpl', 'if':'role && affiliation', cn:[{tag: 'span', cls: 'separator', html:' at '}]},
						{ tag: 'tpl', 'if': 'affiliation', cn:[
							{ tag: 'span', html:'{affiliation}', 'data-field':'affiliation' }]
						}]
					}]
				},
				{ tag: 'tpl', 'if':'!hideProfile && location', cn:[
					{ cls: 'location', html:'{location}', 'data-field':'location' }]},

				{ cls: 'actions', cn: [
					{ cls: 'chat', html: 'Chat'}
				]},
			]
		},{
			cls:'nib', 'data-qtip':'Options'
		}]
	}),

	renderSelectors:{
		cardEl: '.contact-card',
		chatEl: '.actions .chat'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.enableBubble('presence-changed');
		this.userObject = this.record;
		this.username = this.userObject.getId();
		this.userObject.addObserverForField(this, 'Presence', this.presenceChanged, this);
	},

	beforeRender: function(){
		var u = this.record;
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{}, u.getData() );
		this.renderData = Ext.apply(this.renderData, {hideProfile: $AppConfig.disableProfiles === true});
		this.renderData.name = u.getName();
	},

	afterRender: function(){
		this.callParent(arguments);
		this.enableProfileClicks(this.el.down('.avatar'), this.el.down('.name'));
		this.maybeShowChat(this.chatEl);
		this.updateLayout();

		this.mon(this.el,'click', this.clicked, this);

		this.updatePresenceState();
	},


	clicked: function(e){
		var nib = e.getTarget('.nib');
		try{
			if(nib){
				this.addToContactsClicked(e);
			}
			else {
				this.startChat();
			}
		}
		catch(er){
			this.fireEvent('blocked-click', this, this.userObject.getId());
		}
	},

	addToContactsClicked: function(e){
        var me = this;
        console.log('Should add to contacts');
        var pop,
            el = e.target,
            alignmentEl = e.target,
            alignment = 'tl-tr?',
            //play = Ext.dom.Element.getViewportHeight() - Ext.fly(el).getY(),
            id = me.userObject.getId(),
            open = false,
            offsets = [10, -18];

            Ext.each(Ext.ComponentQuery.query('activity-popout,contact-popout'),function(o){
                if(o.record.getId()!==id || me.userObject.modelName !== o.record.modelName){ o.destroy(); }
                else { open = true;  o.toFront();}
            });

        if(open){return;}

        pop = NextThought.view.account.contacts.management.Popout.create({record: me.userObject, refEl: Ext.get(el)});

        pop.show();
        pop.alignTo(alignmentEl,alignment,offsets);

    },

	isOnline: function(val){
		return (val || this.userObject.getPresence().toString()) === 'Online';
	},

	updatePresenceState: function(value){
		if(!this.cardEl){
			return;
		}
		if(this.isOnline((value && value.toString)? value.toString() : value)){
			this.cardEl.removeCls('Offline');
		}
		else{
			this.cardEl.addCls('Offline');
		}

		this.maybeShowChat(this.chatEl);
	},

	presenceChanged: function(key, value){
		this.updatePresenceState(value);
		this.fireEvent('presence-changed', this);
	},

	getUserObject: function(){
		return this.userObject;
	}
});
