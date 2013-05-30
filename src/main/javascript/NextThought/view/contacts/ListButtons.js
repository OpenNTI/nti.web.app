Ext.define('NextThought.view.account.contacts.ListButtons',{
    extend: 'Ext.Component',
    alias: 'widget.list-buttons',
    requires: [
    ],

    cls: 'contact-buttons list-buttons',

    autoEl: { cn:[
		{cls: 'create-list contact-button', html: 'create list'}
        ]
    },

	renderSelectors: {
		createEl: '.create-list'
	},

    afterRender: function(){
        this.callParent(arguments);
		this.createEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

		if(!$AppConfig.service.canFriend()){
			this.createEl.hide();
		}

        this.mon(this.el, 'click', this.onClick, this);
    },

    onClick: function(evt) {
		this.fireEvent('click', evt.getTarget(), this);
    }

});
