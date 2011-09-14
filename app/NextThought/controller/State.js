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
        var me = this,
            push = window.history.pushState;

        me._currentState = {};

        me.control({
            'master-view':{
                'restore': me.restoreState
            },
            'panel[cls=x-application-mode-pane]': {
                'activate-mode': me.trackMode
            }
        });

        window.onpopstate = function(e){
            me.isPoppingHistory = true;
            me.onPopState(e);
            me.isPoppingHistory = false;
        };

        window.history.pushState = function(){
            if(!me.isPoppingHistory && push){
                push.apply(history, arguments);
            }
        };

    },

    onPopState: function(e) {
        if(!NextThought.isInitialised){
            return;
        }
        var s = e?e.state:null,
            v = this.getViewport();
        if(!v){
            console.log('no viewport');
            return;
        }
        v.fireEvent('restore', s || BASE_STATE);
    },


    trackMode: function(modeId){
        if(this._currentState.active != modeId && NextThought.isInitialised){
            console.log(this._currentState.active, modeId);
            this._currentState.active = modeId;
            history.pushState(this._currentState, 'Title Goes Here');
        }
    },


    restoreState: function(stateObject){
        var replaceState = false;
        if(stateObject == PREVIOUS_STATE){
            replaceState = true;
            stateObject = this.loadState();
        }

        var c = Ext.getCmp(stateObject.active);
        if(c){
            this._currentState.active = stateObject.active;
            c.activate();
        }

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
                    console.log(e, e.message, e.stack);
                }
            }
            else {
                console.log('The key', key, 'did not point to a component with a restore method:', c);
            }
        }

        if(replaceState)
            history.replaceState(this._currentState);
    },



    loadState: function(){
        //TODO: save/read state to/from browser/server

        return history.state || {
            active: 'reader',
            reader:{
                page: '/prealgebra/sect0001.html',
                index: '/prealgebra/eclipse-toc.xml'
            }
            /* home:{} ... */
        };
    }
});