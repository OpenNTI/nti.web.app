Ext.define('NextThought.view.account.contacts.GroupButtons',{
    extend: 'Ext.Component',
    alias: 'widget.group-buttons',
    requires: [
    ],

    cls: 'group-buttons',

    autoEl: { cn:[
		{cls: 'create-group group-button', html: 'create group'},
        {cls: 'join-group group-button', html: 'join group'}
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
