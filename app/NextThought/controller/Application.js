Ext.define('NextThought.controller.Application', {
    extend: 'Ext.app.Controller',
    views: ['Viewport'],
    refs: [{ ref: 'viewport', selector: 'master-view' }],

    init: function() {
        var me = this,
            l = NextThought.librarySource = Ext.create('NextThought.Library');

        l.on('loaded', function(){
            //TODO: Restore last state
            var b,
                restoredState = {
                    page: '/prealgebra/sect0001.html',
                    titleIndex: '/prealgebra/eclipse-toc.xml'
                };

            b = l.getTitle(restoredState.titleIndex);

            if(b){
                try{
                    me.getViewport().fireEvent('navigate',b, restoredState.page);
                    return;
                }
                catch(e){
                    console.log(e);
                }
            }

                Ext.getCmp('home').activate();

        });
    }
});