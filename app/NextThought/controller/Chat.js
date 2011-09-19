Ext.define('NextThought.controller.Chat', {
    extend: 'Ext.app.Controller',
    requires: [
    ],

    views: [
        'windows.ChatWindow'
    ],

    refs: [
    ],

    init: function() {
        this.control({
            'leftColumn button[showChat]':{
                click: function(){
                    Ext.create('window.chat').show();
                }
            }
        });
    }
});