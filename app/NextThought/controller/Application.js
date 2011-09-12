Ext.define('NextThought.controller.Application', {
    extend: 'Ext.app.Controller',
    views: ['Viewport'],
    refs: [{ ref: 'viewport', selector: 'master-view' }],

    init: function() {
        var me = this,
            l = NextThought.librarySource = Ext.create('NextThought.Library');

        l.on('loaded', function(){
            //TODO: Restore last state
            var b = l._library.titles[0];
            me.getViewport().fireEvent('navigate',b, b.root+'sect0001.html');
        });
    }
});