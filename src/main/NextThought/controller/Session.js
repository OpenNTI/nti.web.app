Ext.define('NextThought.controller.Session', {
	extend: 'Ext.app.Controller',

	requires:[
		'NextThought.cache.UserRepository',
		'NextThought.util.Base64',
		'NextThought.proxy.Socket',
		'Ext.util.Cookies'

	],

	models: [
		'User',
		'Service'
	],

	views: [
		'widgets.main.SessionInfo'
	],

	statics: {
		login: function(app){
			console.groupCollapsed('Session Setup');

			function success(){
				Globals.removeLoaderSplash();
				app.fireEvent('session-ready');
				console.groupEnd();
				NextThought.controller.Application.launch();
			}

			function showLogin(){
				var host = $AppConfig.server.host,
					url = host + $AppConfig.server.login;
				location.replace( url +
						"?return=" + encodeURIComponent(location.href) +
						"&host=" + encodeURIComponent(host));
			}

			this.attemptLogin(success,showLogin);
		},


		attemptLogin: function(successCallback, failureCallback){
			var m = this,
				s = $AppConfig.server,
				h = s.host, d = s.data, ping = 'logon.ping',
				u  = decodeURIComponent( Ext.util.Cookies.get('username') );
			
			function getLink(o, relName){
				var l = (o||{}).Links || [],
					i = l.length-1;
				for(;i>=0; i--){
					if(l[i].rel === relName){
						return l[i].href;
					}
				}
				return null;
			}

			Ext.Ajax.request({
				url: h + d + ping,
				callback: function(q,s,r){
					var l;
					try{ l= getLink(Ext.decode(r.responseText),'logon.handshake'); } catch(e){}
					if(!s || !l){
						return failureCallback.call(m);
					}
					Ext.Ajax.request({
						method: 'POST',
						url: h + l,
						params : {
							username: u
						},
						callback: function(q,s,r){
							if(!s){
								return failureCallback.call(m);
							}

							console.log(Ext.decode(r.responseText));
							m.resolveService(successCallback,failureCallback);
						}
					});
				}
			});
		},


		resolveService: function(successCallback, failureCallback){
			var m = this,
				s = $AppConfig.server;

			try{
				Ext.Ajax.request({
					url: s.host + s.data,
					timeout: 20000,
					headers:{
						'Accept': 'application/vnd.nextthought.workspace+json'
					},
					scope: this,
					callback: function(q,success,r){
						if(!success){
							failureCallback.call(m);
							return;
						}
						try{
							var doc = Ext.decode(r.responseText),
								user = doc.Items[0].Title;

							$AppConfig.service = Ext.create('NextThought.model.Service', doc, user);
							m.attemptLoginCallback(user,successCallback, failureCallback);
						}
						catch(e){
							Ext.Ajax.request({
								method: 'POST',
								url: s.host + s.data + 'logout',
								callback: function(){
									failureCallback.call(m);
								}
							});

						}
					}
				});
			}
			catch(e){
				console.error('AttemptLogin Exception: ', e.message, '\n', e.stack);
			}
		},

		attemptLoginCallback: function(username,successCallback, failureCallback){
			var me = this;
			$AppConfig.username = username;
			Socket.setup();

			UserRepository.prefetchUser(username, function(users){
				var user = users[0];
				if(user){
					$AppConfig.userObject = user;
					successCallback.call(me);
				}
				else{
					failureCallback.call(me);
				}
			});
		}
	},

	init: function() {
		this.control({
			'session-info' : {
				'logout': this.handleLogout
			}
		},{});
	},

	handleLogout: function() {
		var s = $AppConfig.server,
			me = this;

		Socket.tearDownSocket();
		//
	}
});
