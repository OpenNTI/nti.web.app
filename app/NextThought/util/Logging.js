Ext.define('NextThought.util.Logging',
    {
        alternateClassName: 'Logging',
        statics: {
            logAndAlertError: function(msg) {
                Ext.window.MessageBox.alert('ERROR', msg);

                //console log if debugging is on...
                if(NextThought.isDebug) {
                    console.log("Error", arguments);
                }

            }
        }
});
