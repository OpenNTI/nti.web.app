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

		me.isHangout = this.getController('Google').isHangout();

        me.control({
            'master-view':{
                'restore': me.restoreState
            },
            'modeContainer': {
                'activate-mode': me.trackMode
            }
        },{});

        window.onpopstate = function(e){
            me.isPoppingHistory = true;
            me.onPopState(e);
            me.isPoppingHistory = false;
        };

        window.history.pushState = function(s){
            if(!me.isPoppingHistory && push){
				me._currentState = Ext.Object.merge(me._currentState, s);
				if(me.fireEvent('stateChange',s))
                	push.apply(history, arguments);
            }
        };

    },


	getState: function(){
		return Ext.clone(this._currentState);
	},


    onPopState: function(e) {
        if(!NextThought.isInitialised || this.isHangout){
            return;
        }

        var s = e?e.state:null,
            v = this.getViewport();
        if(!v){
            console.error('no viewport');
            return;
        }
        //TODO : this logic needs to be re-evaluated.  In the case of an in page submit in the reader, (mathcounts),
        //the state is null and the app renders the default page, mathcounts data then needs to be renavigated to.
        //v.fireEvent('restore', s || BASE_STATE);
        if (s) v.fireEvent('restore', s);
    },


    trackMode: function(modeId){
        if(this._currentState.active != modeId && NextThought.isInitialised){
            //console.debug(this._currentState.active, modeId);
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
                    console.error('Setting state: ', e, e.message, e.stack);
                }
            }
            else {
                console.warn('The key', key, 'did not point to a component with a restore method:', c);
            }
        }

        if(replaceState)
            history.replaceState(this._currentState,'Title');
    },



    loadState: function(){
		if(this.isHangout){
			console.info('Setting up state for Hangout...');
			return {};
		}

        //TODO: save/read state to/from browser/server
        return history.state || {
//            active: 'classroom',
            active: 'reader',
            reader:{
                page: '/prealgebra/sect0001.html',
                index: '/prealgebra/eclipse-toc.xml'
            }
            /* home:{} ... */
        };
    }
});
