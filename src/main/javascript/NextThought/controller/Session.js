Ext.define('NextThought.controller.Session', {
	extend: 'Ext.app.Controller',

	requires:[
		'NextThought.cache.UserRepository',
		'NextThought.proxy.Socket',
		'Ext.util.Cookies'

	],

	models: [
		'User',
		'Service'
	],

	views: [
		'Window',
        'menus.Settings'
	],

	statics: {
		login: function(app){
			function success(){
				app.fireEvent('session-ready');
				NextThought.controller.Application.launch();
			}

			function showLogin(timedout){
				var me = this,
					url = Ext.String.urlAppend(
							Ext.String.urlAppend(
									$AppConfig.server.login,
									"return="+encodeURIComponent(location.toString())),
							"host=" + encodeURIComponent(getURL()));

				if(timedout){
					alert('a request timed out');
					return;
				}
				location.replace( url );
			}

			this.attemptLogin(success,showLogin);
		},


		attemptLogin: function(successCallback, failureCallback){
			var m = this,
				s = $AppConfig.server,
				d = s.data, ping = 'logon.ping',
				u  = decodeURIComponent( Ext.util.Cookies.get('username') );
			
			function getLink(o, relName){
				o = o || {};
				o = o.responseText || o;
				if(typeof o === 'string') { o = Ext.decode(o); }
				var l = o.Links || [], i = l.length-1;
				for(;i>=0; i--){ if(l[i].rel === relName){ return l[i].href; } }
				return null;
			}
			try{

			Ext.Ajax.request({
				timeout: 60000,
				url: getURL(d + ping),
				callback: function(q,s,r){
					var l = getLink(r,'logon.handshake');
					if(!s || !l){
						if(r.timedout){
							console.log('Request timed out: ', r.request.options.url);
						}
						return Ext.callback(failureCallback,m,[r.timedout]);
					}
					Ext.Ajax.request({
						method: 'POST',
						timeout: 60000,
						url: getURL(l),
						params : {
							username: u
						},
						callback: function(q,s,r){
							l = getLink(r,'logon.continue');
							if(!s || !l){
								if(r.timedout){
									console.log('Request timed out: ', r.request.options.url);
								}
								return failureCallback.call(m,r.timedout);
							}
							m.logoutURL = getLink(r,'logon.logout');
							m.resolveService(successCallback,failureCallback);
						}
					});
				}
			});
			}
			catch(err){
				alert('Could not request handshake from Server.\n'+err.message);
			}
		},


		resolveService: function(successFn, failureFn){
			var m = this,
				s = $AppConfig.server;

			try{
				Ext.Ajax.request({
					url: getURL(s.data),
					timeout: 20000,
					headers:{
						'Accept': 'application/vnd.nextthought.workspace+json'
					},
					scope: this,
					callback: function(q,success,r){
						if(!success){
							alert('Oh No! Could not talk to the server!');
							m.handleLogout();
							console.log('Could not resolve service document\nrequest:',q,'\n\nresponse:',r,'\n\n');
							return;
						}
						try{
							var doc = Ext.decode(r.responseText),
								user = doc.Items[0].Title;

							$AppConfig.service = Ext.create('NextThought.model.Service', doc, user);
							m.attemptLoginCallback(user,successFn);
						}
						catch(e){
							console.error(Globals.getError(e));
						}
					}
				});
			}
			catch(e){
				console.error('AttemptLogin Exception: ', Globals.getError(e));
			}
		},


		attemptLoginCallback: function(username,successCallback, failureCallback){
			var me = this;
			Socket.setup();

			UserRepository.getUser(username, function(user){
				if(user){
					user.data.Presence = 'Online';
					$AppConfig.userObject = user;
					successCallback.call(me);
				}
				else{
					console.log('could not resolve user',username, arguments);
					failureCallback.call(me);
				}
			});
		}
	},

	init: function() {
		this.control({
			'settings-menu [action=logout]' : {
				'click': this.handleLogout
			}
		},{});
	},

	handleLogout: function() {
		var s = $AppConfig.server,
			url = getURL(Ext.String.urlAppend(
					this.self.logoutURL,
					'success='+encodeURIComponent(location.href)));
		//Log here to help address #550.
		console.log('logout, redirect to ' + url);
		Socket.tearDownSocket();
		app.fireEvent('session-closed');
		location.replace(url);
	}
});
