
describe('Preference Manager Tests', function(){
	var PreferenceManager,
		baseUrl = '/dataserver/++preferences++/',
		preferenceObject = {
		    'ChatPresence': {
		        'Active': {
		            'Class': 'Preference_ChatPresence_Active', 
		            'MimeType': 'application/vnd.nextthought.preference.chatpresence.active', 
		            'show': 'chat', 
		            'status': '', 
		            'type': 'available'
		        }, 
		        'Available': {
		            'Class': 'Preference_ChatPresence_Available', 
		            'MimeType': 'application/vnd.nextthought.preference.chatpresence.available', 
		            'show': 'chat', 
		            'status': 'Available', 
		            'type': 'available'
		        }, 
		        'Away': {
		            'Class': 'Preference_ChatPresence_Away', 
		            'MimeType': 'application/vnd.nextthought.preference.chatpresence.away', 
		            'show': 'away', 
		            'status': 'Away', 
		            'type': 'available'
		        }, 
		        'Class': 'Preference_ChatPresence', 
		        'DND': {
		            'Class': 'Preference_ChatPresence_DND', 
		            'MimeType': 'application/vnd.nextthought.preference.chatpresence.dnd', 
		            'show': 'dnd', 
		            'status': 'Do Not Disturb', 
		            'type': 'available'
		        }, 
		        'MimeType': 'application/vnd.nextthought.preference.chatpresence'
		    }, 
		    'Class': 'Preference_Root', 
		    'MimeType': 'application/vnd.nextthought.preference.root', 
		    'WebApp': {
		        'Class': 'Preference_WebApp', 
		        'MimeType': 'application/vnd.nextthought.preference.webapp', 
		        'preferFlashVideo': false
		    }, 
		    'href': '/dataserver2/users/andrew.ligon@nextthought.com/++preferences++/'
		};

	function compareModel(model){
		var i, cls = model.get('Class'),
			names = cls.split('_'),
			json = preferenceObject;

		for(i = 1; i < names.length; i++){
			if(json[names[i]]){
				json = json[names[i]];
			}else{
				return false;
			}
		}

		return Ext.JSON.encode(model.raw) === Ext.JSON.encode(json);
	}

	beforeEach(function(){
		var simConfig = {}
		PreferenceManager = Ext.create('NextThought.preference.Manager',{ href: '/dataserver/++preferences++'});

		$AppConfig.Preferences = {
			baseUrl: '/dataserver/++preferences++'
		};

		spyOn(PreferenceManager, 'getSubPreference').andCallThrough();
		spyOn(PreferenceManager, 'loadSubPreference').andCallThrough();
		spyOn(PreferenceManager, 'setSubPreference').andCallThrough();

		function genResponse(json){
			return json;
		}

		
		simConfig[baseUrl] = {
			stype: 'json',
			data: [genResponse(preferenceObject)]
		};

		simConfig[baseUrl + 'ChatPresence'] = {
			stype: 'json',
			data: [genResponse(preferenceObject.ChatPresence)]
		};

		simConfig[baseUrl + 'WebApp'] = {
			stype: 'json',
			data: [genResponse(preferenceObject.WebApp)]
		};

		simConfig[baseUrl + 'ChatPresence/Active'] = {
			stype: 'json',
			data: [genResponse(preferenceObject.ChatPresence.Active)]
		};

		simConfig[baseUrl + 'ChatPresence/Available'] = {
			stype: 'json',
			data: [genResponse(preferenceObject.ChatPresence.Available)]
		};

		Ext.ux.ajax.SimManager.init({
			delay: 300
		}).register(simConfig);
	});

	describe('Loading a parent also loads the chilren, but not siblings', function(){
		it('Loading the ChatPresence loads ChatPresence/children and  not WebApp', function(){
			var flag = false;
			
			PreferenceManager.getPreference('ChatPresence', function(value){
				flag = true;
			}, this);

			waitsFor(function(){
				return flag;
			},'getPreference never finished', 600);

			runs(function(){
				var root = PreferenceManager.root,
					chat = root.get('ChatPresence');

				expect(chat.isModel).toBeTruthy();
				expect(chat.isFuture).toBeFalsy();
				expect(compareModel(chat)).toBeTruthy();
				expect(compareModel(chat.get('Active'))).toBeTruthy();
				expect(compareModel(chat.get('Available'))).toBeTruthy();
				expect(compareModel(chat.get('Away'))).toBeTruthy();
				expect(compareModel(chat.get('DND'))).toBeTruthy();
				expect(root.get('WebApp').isFuture).toBeTruthy();

				expect(PreferenceManager.getSubPreference).toHaveBeenCalledWith('ChatPresence');
				expect(PreferenceManager.loadSubPreference).toHaveBeenCalled();
				expect(PreferenceManager.setSubPreference).toHaveBeenCalledWith(preferenceObject.ChatPresence);
			});
		});

		it('Loading Active doesn\' load available, away, or dnd', function(){
			var flag = false;

			PreferenceManager.getPreference('ChatPresence/Active', function(value){
				flag = true;
			}, this);

			waitsFor(function(){
				return flag;
			},'getPreference never finished', 600);

			runs(function(){
				var root = PreferenceManager.root,
					chat = root.get('ChatPresence'),
					active = chat.get('Active');

				expect(active.isModel).toBeTruthy();
				expect(active.isFuture).toBeFalsy();
				expect(compareModel(active)).toBeTruthy();
				expect(chat.get('Available').isFuture).toBeTruthy();
				expect(chat.get('Away').isFuture).toBeTruthy();
				expect(chat.get('DND').isFuture).toBeTruthy();
				expect(root.get('WebApp').isFuture).toBeTruthy();
			});
		});

		it('Loading Active, then loading ChatPresence loads available', function(){
			var flag = false, result;

			PreferenceManager.getPreference('ChatPresence/Active', function(value){
				PreferenceManager.getPreference('ChatPresence', function(value){
					result = value;
					flag = true;
				});
			});

			waitsFor(function(){
				return flag;
			},'getPreference never finished', 1200);

			runs(function(){
				var active = result.get('Active'),
					available = result.get('Available'),
					away = result.get('Away'),
					dnd = result.get('DND');

				expect(active.isFuture).toBeFalsy();
				expect(available.isFuture).toBeFalsy();
				expect(away.isFuture).toBeFalsy();
				expect(dnd.isFuture).toBeFalsy();
			});
		});
	});

	it('Getting the ChatPresence doesn\'t call loadSubPreference if its already loaded', function(){
		var flag = false,
			chatModel = Ext.create('NextThought.model.preference.ChatPresence', preferenceObject.ChatPresence),
			activeModel = Ext.create('NextThought.model.preference.chatpresence.Active', preferenceObject.ChatPresence.Active),
			availableModel = Ext.create('NextThought.model.preference.chatpresence.Available', preferenceObject.ChatPresence.Available),
			awayModel = Ext.create('NextThought.model.preference.chatpresence.Away', preferenceObject.ChatPresence.Away),
			dndModel = Ext.create('NextThought.model.preference.chatpresence.DND', preferenceObject.ChatPresence.DND);

		//Set the sub preferences so it doesn't have in futures
		chatModel.set('Active', activeModel);
		chatModel.set('Available', availableModel);
		chatModel.set('Away', awayModel);
		chatModel.set('DND', dndModel);
		
		PreferenceManager.root.set('ChatPresence', chatModel);

		PreferenceManager.getPreference('ChatPresence', function(value){
			flag = true;
		}, this);

		waitsFor(function(){
			return flag;
		},'getPreference never finished', 600);

		runs(function(){
			var root = PreferenceManager.root,
				chat = root.get('ChatPresence');

			expect(chat.isModel).toBeTruthy();
			expect(chat.isFuture).toBeFalsy();
			expect(root.get('WebApp').isFuture).toBeTruthy();

			expect(PreferenceManager.getSubPreference).toHaveBeenCalledWith('ChatPresence');
			expect(PreferenceManager.loadSubPreference).not.toHaveBeenCalled();
			expect(PreferenceManager.setSubPreference).not.toHaveBeenCalled();
		});
	});

	it('Getting an invalid preference returns falsy', function(){
		var flag = false, result;

		PreferenceManager.getPreference('some/preference', function(value){
			result = value;
			flag = true;
		}, this);

		waitsFor(function(){
			return flag;
		},'getPreference never finished', 600);

		runs(function(){
			var root = PreferenceManager.root;

			expect(result).toBeFalsy();
			expect(root.get('ChatPresence').isFuture).toBeTruthy();
			expect(root.get('WebApp').isFuture).toBeTruthy();

			expect(PreferenceManager.getSubPreference).toHaveBeenCalledWith('some/preference');
			expect(PreferenceManager.loadSubPreference).not.toHaveBeenCalled();
			expect(PreferenceManager.setSubPreference).not.toHaveBeenCalled();

		});
	});

	it('Saving a field calls Ext.Ajax.request with the correct values', function(){
		var flag = false, result;

		PreferenceManager.getPreference('ChatPresence', function(value){
			result = value;
			flag = true;
		});

		waitsFor(function(){
			return flag;	
		},'getPreference never finished', 600);

		runs(function(){
			var expected = {
				url: result.getResourceUrl(),
				method: 'PUT',
				jsonData: result.asJSON()
			};

			spyOn(Ext.Ajax,'request');
			result.save();

			expect(Ext.Ajax.request).toHaveBeenCalledWith(expected);
		});
	});


});