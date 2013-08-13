Ext.define('NextThought.view.Main', {
    extend: 'Ext.container.Viewport',
    alias: 'widget.master-view',

    requires: [
        'Ext.layout.container.Border',
        'NextThought.view.account.Identity',
        'NextThought.view.MessageBox',
        'NextThought.view.Navigation',
        'NextThought.view.SideBar',
        'NextThought.view.Views',
        'NextThought.view.MessageBar'
    ],

    border: false,
    frame: false,
    defaults: { border: false, frame: false },
    layout: 'border',
    id: 'viewport',
    ui: 'nextthought',
    minWidth: 1024,

    items: [
        {xtype: 'main-navigation', id: 'nav', region: 'north'},
        {xtype: 'main-views', id: 'view', region: 'center'},
        {xtype: 'box', hostTo: 'sidebar', region: 'east', weight: 30, minWidth: 260}
    ],

    constructor: function () {
        this.hidden = Boolean(NextThought.phantomRender);
        this.callParent(arguments);
    },

    afterRender: function () {
        this.callParent(arguments);

        var map = {
            width: 'right',
            height: 'bottom',
            widthp: 'left',
            heightp: 'top'
        };

        Ext.Object.each(Ext.getScrollbarSize(), function (k, v) {
            if (v) {
                Ext.getBody().addCls('detected-scrollbars');

                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = [
                    '.scroll-pos-' + map[k] + ' { ' + map[k + 'p'] + ':-' + v + 'px !important; } ',
                    '.scroll-margin-' + map[k] + ' { margin-' + map[k] + ':' + v + 'px !important; } ',
                    '.scroll-padding-' + map[k] + ' { padding-' + map[k] + ':' + v + 'px !important; } '
                ].join(' \r\n ');

                document.getElementsByTagName('head')[0].appendChild(style);

            }
        });

        Ext.EventManager.onWindowResize(this.detectZoom, this);
        this.detectZoom();
        this.views = this.down('main-views');

        this.sidebar = this.add({
            xtype: 'main-sidebar',
            host: this.down('[region=east][hostTo=sidebar]'),
            hidden: this.hidden
        });

        this.identity = this.sidebar.add({xtype: 'identity'});

        Ext.getDoc().on('touchmove', function (e) {
            e.preventDefault();
        });

        if(Ext.is.iPad){
            var me = this,
                optWindow;

            /*If user rotates to portrait, display screen saying to rotate it.
            * if they rotate back to landscape, destroy screen*/
            window.addEventListener('orientationchange', function(){
                if(optWindow){
                    optWindow.destroy();
                    optWindow = null;
                }
                if(Math.abs(window.orientation) != 90 ){
                    optWindow = me.createPortraitOrientationScreen();
                    optWindow.show();
                }
            }, true);

            if(Math.abs(window.orientation) != 90){
                optWindow = this.createPortraitOrientationScreen();
                optWindow.show();
            }
        }
    },

    createPortraitOrientationScreen: function(){
        var optWindow = Ext.widget('nti-window',{
            title: 'Portrait mode unavailabe',
            closeAction: 'hide',
            width: '100%',
            height: '100%',
            layout: 'fit',
            modal: true,
            closable:false,
            items: {
                xtype: 'component',
                cls: 'padded',
                autoEl: {
                    tag: 'iframe',
                    src: 'resources/portraitOrientation.html',
                    frameBorder: 0,
                    marginWidth: 0,
                    marginHeight: 0,
                    seamless: true,
                    transparent: true,
                    allowTransparency: true,
                    style: 'overflow-x: hidden; overflow-y:auto'
                }
            }
        });
        return optWindow;
    },


    detectZoom: function () {
        var z = 1,
            currentBar;
        try {
            z = DetectZoom.zoom();
            console.log("Zoom:", z);
        }
        catch (e) {
            console.error('Detect Zoom failed to load');
        }

        //IEs returns jacked up coordinates when zoom is applied.  Scold if they are in
        //IE and a zoom level other than 1
        if (Ext.isIE) {
            if (z !== 1) {
                Ext.widget('message-bar', {
                    renderTo: Ext.getBody(),
                    messageType: 'zoom',
                    message: 'Your browser\'s current zoom setting is not fully supported. Please reset it to the default zoom.'
                });
            }
            else {
                //todo: Find another way to do this: (probably move it into the bar itself)
                currentBar = Ext.ComponentQuery.query('message-bar');
                if (!Ext.isEmpty(currentBar)) {
                    currentBar[0].destroy();
                }
            }
        }
    }
});
