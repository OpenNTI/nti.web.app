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
				this.clearAuth();
				location.replace( $AppConfig.server.host + $AppConfig.server.login + "?return=" + encodeURIComponent(location.href));
			}

			this.attemptLogin(success,showLogin);
		},


		clearAuth: function(){
			function clearCookie(name, domain){
				document.cookie = name+'=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/'+
						(domain? ('; domain='+domain): '');
			}

			var domain = $AppConfig.server.domain;
			clearCookie('auth_tkt',domain);
			clearCookie('auth_tkt','.'+domain);
		},


		attemptLogin: function(successCallback, failureCallback){
			var m = this,
				s = $AppConfig.server;

			try{
				Ext.Ajax.request({
					url: Ext.urlAppend(s.host + s.data, Ext.String.format('_dc={0}',Ext.Date.now())),
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
		Ext.Ajax.request({
			url: s.host + s.data + 'logout',
			callback: function(){
				me.self.clearAuth();
				window.location.reload();
			}
		});
	}
});
