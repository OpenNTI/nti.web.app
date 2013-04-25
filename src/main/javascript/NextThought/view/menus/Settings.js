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
        var items = [],
			links = $AppConfig.userObject.get('Links') || {},
			welcomeLink = links.getLinksForRel ? links.getLinksForRel('content.permanent_welcome_page'): null,
            childsLink = links.getLinksForRel ? links.getLinksForRel('childrens-privacy') : null;

        items.push({ action: 'account', text: 'My Account'});

		if(!Ext.isEmpty(welcomeLink)){
			items.push({ action: 'welcome', text: 'Welcome Guide', link: welcomeLink.first()});
		}

        items.push({ action: 'about', text: 'About', href: 'http://www.nextthought.com/', hrefTarget: '_blank'});

        //disable help because there are now 3 seperate help documents for different environments.  ugh!
        //items.push({ action: 'help', text: 'Help'});

        items.push({ action: 'privacy', text: 'Privacy'});
        if(!Ext.isEmpty(childsLink)){
            items.push({ action: 'childrens-privacy', text: 'Children\'s Privacy'});
        }
        items.push({ action: 'terms', text: 'Terms of Service'});


        items.push({ action: 'contact', text: 'Contact Us'});

        items.push({ xtype:'menuseparator' });
        items.push({ action: 'logout', text: 'Sign Out'});

        //add!
        this.add(items);
    }
});
