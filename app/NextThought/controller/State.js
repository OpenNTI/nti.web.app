PREVIOUS_STATE = 'previous-state';
BASE_STATE = { active: 'home' };

Ext.define('NextThought.controller.State', {
    extend: 'Ext.app.Controller',

    views: [
        'Viewport'
    ],

    refs: [
        { ref: 'viewport', selector: 'master-view' },
        { ref: 'readerMode', selector: 'reader-mode-container' },
        { ref: 'readerPanel', selector: 'reader-mode-container reader-panel' }
    ],

    init: function() {
        this._currentState = {};

        this.control({
            'master-view':{
                'restore': this.restoreState
            },

            'panel[cls=x-application-mode-pane]': {
                'activate-mode': this.trackMode
            }
        });

        var me = this;
        window.onpopstate = function(e){
            me.onPopState(e);
        };
    },

    onPopState: function(e) {
        var s = e?e.state:null;
        if(!s){
            console.log(e, 'What? no state in the popped history?? ignoring.');
            s = BASE_STATE;
        }
        console.log('History Popped, State being restored: ',e);
        this.getViewport().fireEvent('restore', s);
    },


    trackMode: function(modeId){
        if(this._currentState.active != modeId && NextThought.isInitialised){
            this._currentState.active = modeId;
            history.pushState(this._currentState,'title?',window.location);
        }
    },


    restoreState: function(stateObject){
        if(stateObject == PREVIOUS_STATE){
            stateObject = this.loadState();
        }

        var c = Ext.getCmp(stateObject.active);
        if(c) c.activate();

        for(var key in stateObject){
            if(!stateObject.hasOwnProperty(key) || !/object/i.test(typeof(stateObject[key]))) continue;

            c = Ext.getCmp(key);
            if(c && c.restore){
                try{
                    var stateScoped = {};
                    this._currentState[key] = stateScoped[key] = stateObject[key];
                    c.restore(stateScoped);
                }
                catch(e){
                }
            }
            else {
                console.log('The key', key, 'did not point to a component with a restore method:', c);
            }
        }
    },



    loadState: function(){
        //TODO: save/read state to/from browser/server

        return {
            active: 'reader',
            reader:{
                page: '/prealgebra/sect0001.html',
                index: '/prealgebra/eclipse-toc.xml'
            }
            /* home:{} ... */
        };
    }
});