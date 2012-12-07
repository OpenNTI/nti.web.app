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

    afterRender: function(){
        this.callParent(arguments);

		if(!$AppConfig.service.canCreateDynamicGroups()){
			this.el.down('.create-group').hide();
		}

        this.mon(this.el, 'click', this.onClick, this);
    },

    onClick: function(evt) {
        this.fireEvent('click', evt.getTarget(), this);
    }

});
