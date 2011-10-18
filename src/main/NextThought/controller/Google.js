Ext.define('NextThought.controller.Google', {
    extend: 'Ext.app.Controller',

    init: function() {
        if(typeof gapi != 'undefined'){
            console.log("\n\n\n\n",gapi.hangout,"\n\n\n\n\n\n");

            gapi.hangout.data.addStateChangeListener(function(){
                console.log("\n\n\n\nState Change Listener: ",arguments,"\n\n\n\n");
            });
            gapi.hangout.addParticipantsListener(function(){
                console.log("\n\n\n\nParticipants Listener: ",arguments,"\n\n\n\n");
            });
        }
    }
});
