Ext.define('NextThought.view.widgets.main.ProfileHeader', {
	extend: 'Ext.Component',
    alias: 'widget.profile-header',
    requires: [
    ],

    layout: 'hbox',
    border: false,
    frame: false,
    renderTpl: new Ext.XTemplate(
        '<div class="x-profile-header">',
            '<span class="edit"></span>',
            '<img src="{[this.hres(values.avatarURL)]}" width=128"/>',
            '<div>',
                '<span class="name">{realname}</span> ',
            '</div>',
            '<div>',
                '<span class="bio">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum lorem eros, sollicitudin sit amet congue id, laoreet eget felis. Praesent?</span> ',
            '</div>',
        '</div>',
        {
            compiled: true,
            disableFormats: true,
            hres: function(url){
                return url.replace(/s=\d+/i, 's=128');
            }
        }),

    initComponent: function(){
   		this.callParent(arguments);
        this.updated(_AppConfig.userObject);
    },

    afterRender: function(){
        this.callParent(arguments);
        this.el.addClsOnOver('hover');
        this.el.on('click', this.click, this);
    },

    click: function(event, target, eOpts){
        target = Ext.get(target);
        if(target && target.hasCls('edit')){
            this.fireEvent('edit');
        }
    },


    updated: function(u){
        u.on('changed', this.updated, this);

        Ext.apply(this.renderData, u.data);

        if(this.rendered){
            this.update(this.renderTpl.apply(this.renderData));
        }
    }

});
