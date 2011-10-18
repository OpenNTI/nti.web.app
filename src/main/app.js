document.write('<script	src="'+_AppConfig.server.host+'/socket.io/static/socket.io.js"></script>');

Ext.application({
    name: 'NextThought',
    appFolder: 'src/main/NextThought',

    controllers: [
        'Account',
        'Annotations',
        'Application',
        'Chat',
        'FilterControl',
        'Google',
        'Groups',
        'Home',
        'Modes',
        'ObjectExplorer',
        'Reader',
        'Search',
        'Session',
        'State',
        'Stream'
    ],

    launch: function() {
        NextThought.isDebug = true;

        Ext.JSON.encodeDate = encodeDate

        fixIE();
        Ext.Ajax.timeout==60000;
        Ext.Ajax.on('beforerequest', beforeRequest);
        Ext.EventManager.onWindowResize(resizeBlocker);

        setTimeout(
            function clearMask(){
                Ext.get('loading').remove();
                Ext.get('loading-mask').fadeOut({remove:true});
                resizeBlocker(Ext.Element.getViewWidth());
            },
            100);

        NextThought.controller.Session.login();
    }
});
