PREVIOUS_STATE = 'previous-state';
BASE_STATE = { active: 'home' };

Ext.define('NextThought.controller.State', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.providers.Location'
	],

	constructor: function(){
		var m = this.callParent(arguments);

		this.addEvents('restore');
		this.on('restore',this.restoreState,this);

		return m;
	},

	init: function() {
		var me = this;

		this.application.on('session-ready', this.onSessionReady, this);

		me.currentState = {};

		me.isHangout = this.getController('Google').isHangout();

		me.control({
			'main-views': {
				'activate-view': me.track
			}
		},{});
	},


	onSessionReady: function(){
		window.onhashchange = function() {
			var hash = window.location.hash.substring(1);
			if (hash && window.lastTimeLocationSet && new Date().getTime() - window.lastTimeLocationSet > 1000) {
				LocationProvider.setLocation(hash,(function() {
					var token = {};
					app.registerInitializeTask(token);
					return function(){ app.finishInitializeTask(token); };
				}()),true);
			}
		};


		var me = this,
			history = window.history,
			push = history.pushState || function(){};

		history.replaceState = history.replaceState || function(){};

		history.updateState = function(s){
			console.log('update state', arguments);
			Ext.applyIf(s,{active: me.currentState.active});
			if(!me.isPoppingHistory && push){
				me.currentState = Ext.Object.merge(me.currentState, s);
				window.localStorage.setItem(me.getStateKey(),JSON.stringify(me.currentState));
				return me.fireEvent('stateChange',s);
			}
			return false;
		};

		history.pushState = function(s){
			console.log('push state', arguments);
			if (this.updateState(s)) {
				push.apply(history, arguments);
				if (Ext.isIE) {
					window.lastTimeLocationSet = new Date().getTime();
					window.location.hash = me.getState().location;
				}
			}
		};

		window.onpopstate = function(e){
			me.isPoppingHistory = true;
			me.onPopState(e);
			me.isPoppingHistory = false;
		};
	},


	getState: function(){
		return Ext.clone(this.currentState);
	},


	onPopState: function(e) {
		if(!NextThought.isInitialised || this.isHangout){
			return;
		}
		var s = e?e.state:null;
		if (s) {
			this.fireEvent('restore', s);
		}
	},


	track: function(viewId){
		if(this.currentState.active !== viewId && NextThought.isInitialised){
			//console.debug(this.currentState.active, modeId);
			this.currentState.active = viewId;
			window.history.pushState(this.currentState, 'NextThought: '+viewId);
		}
	},


	restoreState: function(stateObject){
		if(this.restoringState){
			console.warn('Restoring state while one is already restoring...');
			return;
		}
		this.restoringState = true;
		var app = this.application,
			history = window.history,
			replaceState = false, c, key, stateScoped;

		function fin(){
			var token = {};
			app.registerInitializeTask(token);
			return function(){ app.finishInitializeTask(token); };
		}

		if(stateObject === PREVIOUS_STATE){
			replaceState = true;
			stateObject = this.loadState();
			if (history.updateState) {
				history.updateState(stateObject);
			}
		}

		c = Ext.getCmp(stateObject.active);
		if(c){
			this.currentState.active = stateObject.active;
			c.activate();
		}

		for(key in stateObject){
			if(stateObject.hasOwnProperty(key) && /object/i.test(typeof(stateObject[key]))) {
				c = Ext.getCmp(key);
				if(c && c.restore){
					try{
						stateScoped = {};
						this.currentState[key] = stateScoped[key] = stateObject[key];
						c.on('finished-restore',fin(),this,{ single: true });
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
		}

		if(typeof stateObject.location !== 'undefined'){
			LocationProvider.setLocation(stateObject.location, fin(), true);
		}

		if(replaceState) {
			history.replaceState(this.currentState,'Title');
		}

		this.restoringState = false;
	},



	loadState: function(){
		if(this.isHangout){
			console.info('Setting up state for Hangout...');
			return {};
		}

		var defaultState = {
			active: 'library'
		};

		try {
			console.log('local state found', window.localStorage.getItem(this.getStateKey()));
			return Ext.decode( window.localStorage.getItem(this.getStateKey()) ) || defaultState;
		}
		catch(e){
			console.error('failed to decode local state, use default.', Globals.getError(e), window.localStorage);
			window.localStorage.removeItem(this.getStateKey());
			return defaultState;
		}
	},


	getStateKey: function(){
		var username = $AppConfig.username;
		if (!username){
			console.error('unknown username for state mgmt.');
		}
		return btoa('state-' + username);
	}
});
