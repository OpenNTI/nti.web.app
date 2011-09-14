Ext.define('NextThought.controller.Application', {
    extend: 'Ext.app.Controller',

    views: ['Viewport'],

    refs: [{ ref: 'viewport', selector: 'master-view' }],

    init: function() {
        var l = NextThought.librarySource = Ext.create('NextThought.Library');
        l.on('loaded', this.restore, this);
    },

    restore: function(){
        try{
            this.getViewport().fireEvent('restore',PREVIOUS_STATE);
        }
        catch(e){
            console.log(e, e.message, e.stack);
            Ext.getCmp('home').activate();
        }

        NextThought.isInitialised = true;
    }
});