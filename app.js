Ext.Loader.setPath('Ext.ux', 'extjs/examples/ux');
Ext.require([
    'Ext.data.*'
]);

CENTER_WIDTH = 768;
MIN_SIDE_WIDTH = 216;
MIN_WIDTH = 768;

Ext.application({
    name: 'NextThought',
    appFolder: 'app/NextThought',

    controllers: [
        'State',
        'Chat',
        'Account',
        'Annotations',
        'Application',
        'FilterControl',
        'Groups',
        'Login',
        'Modes',
        'ObjectExplorer',
        'Reader',
        'Search',
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

        NextThought.controller.Login.login();
    }
});


function fixIE(){
    if(!Ext.isIE) return;

    Ext.panel.Panel.override({
        render: function(){
            this.callOverridden(arguments);
            var d=this.el.dom;
            d.firstChild.unselectable = true;
            d.unselectable = true;
        }
    });
}

function beforeRequest(connection,options)
{
    if(options&&options.async===false){
        var loc = '';
        try { loc = printStackTrace()[7]; }
        catch (e) { loc = e.stack; }
        console.log('WARNING: Synchronous Call in: ', loc, ' Options:', options );
    }
}

function resizeBlocker(w, h, e){
    var i = !!(w<MIN_WIDTH), b = Ext.getBody(), m = b.isMasked();
    if(i && !m) b.mask("Your browser window is too narrow","viewport-too-small");
    else if(!i && m) b.unmask();
}

function encodeDate(d) {
    return Ext.Date.format(d, 'U');
}