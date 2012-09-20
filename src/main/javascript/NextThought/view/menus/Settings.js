Ext.define('NextThought.view.menus.Settings',{
    extend: 'Ext.menu.Menu',
    alias: 'widget.settings-menu',
    requires: [

    ],
    ui: 'nt',
    plain: true,
    showSeparator: false,
    shadow: false,
    frame: false,
    border: false,
    hideMode: 'display',
    minWidth: 200,

    defaults: {
        ui: 'nt-menuitem',
        xtype: 'menuitem',
        plain: true
    },

    initComponent: function(){
        this.callParent(arguments);

        //setup fields:
        var items = [];
        items.push({ action: 'about', text: 'About', href: 'http://www.nextthought.com/', hrefTarget: '_blank'});
        items.push({ action: 'help', text: 'Help'});
        items.push({ action: 'privacy', text: 'Privacy'});
        items.push({ action: 'terms', text: 'Terms of Service'});
        items.push({ xtype:'menuseparator' });
        items.push({ action: 'account', text: 'Account Settings'});
        items.push({ action: 'logout', text: 'Sign Out'});

        //add!
        this.add(items);
    }
});
