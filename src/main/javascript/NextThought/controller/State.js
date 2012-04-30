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
		var me = this,
			push = history.pushState || function(){};

		history.replaceState = history.replaceState || function(){};

		me.currentState = {};

		me.isHangout = this.getController('Google').isHangout();

		me.control({
			'main-views': {
				'activate-view': me.track
			}
		},{});

		window.onpopstate = function(e){
			me.isPoppingHistory = true;
			me.onPopState(e);
			me.isPoppingHistory = false;
		};

		window.history.updateState = function(s){
			Ext.applyIf(s,{active: me.currentState.active});
			if(!me.isPoppingHistory && push){
				me.currentState = Ext.Object.merge(me.currentState, s);
				return me.fireEvent('stateChange',s);
			}
			return false;
		};

		window.history.pushState = function(s){
			console.log('push state', arguments);
			if (this.updateState(s)) {
				push.apply(history, arguments);
			}
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
			history.pushState(this.currentState, 'NextThought: '+viewId);
		}
	},


	restoreState: function(stateObject){
		if(this.restoringState){
			console.warn('Restoring state while one is already restoring...');
			return;
		}
		this.restoringState = true;
		var app = this.application,
			replaceState = false, c, key, stateScoped;

		function fin(){
			var token = {};
			app.registerInitializeTask(token);
			return function(){ app.finishInitializeTask(token); };
		}

		if(stateObject === PREVIOUS_STATE){
			replaceState = true;
			stateObject = this.loadState();
			window.history.updateState(stateObject);
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

		return {
			active: 'search'
		};

//		return {
//			location: 'tag:nextthought.com,2011-10:AOPS-HTML-prealgebra.0',
//			active: 'reader'
//		};
	}
});
