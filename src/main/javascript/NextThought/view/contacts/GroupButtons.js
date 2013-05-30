Ext.define('NextThought.view.account.contacts.GroupButtons',{
    extend: 'Ext.Component',
    alias: 'widget.group-buttons',
    requires: [
    ],

    cls: 'contact-buttons',

    autoEl: { cn:[
		{cls: 'create-group contact-button', html: 'create group'},
        {cls: 'join-group contact-button', html: 'join group'}
        ]
    },

	renderSelectors: {
		createEl: '.create-group',
		joinEl: '.join-group'
	},

    afterRender: function(){
        this.callParent(arguments);

		if(!$AppConfig.service.canCreateDynamicGroups()){
			this.createEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			this.createEl.hide();
		}

        this.mon(this.el, 'click', this.onClick, this);
    },

    onClick: function(evt) {
        this.fireEvent('click', evt.getTarget(), this);
    }

});
