Ext.define('NextThought.view.account.contacts.GroupButtons',{
    extend: 'Ext.Component',
    alias: 'widget.group-buttons',
    requires: [
    ],

    cls: 'group-buttons',

    autoEl: { cn:[
            {cls: 'join-group', html: 'join group'}
        ]
    },

    afterRender: function(){
        this.callParent(arguments);
        this.mon(this.el, 'click', this.onClick, this);
    },

    onClick: function(evt) {
        this.fireEvent('click', evt.getTarget(), this);
    }

});
