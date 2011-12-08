Ext.define('NextThought.model.Service', {
    extend: 'NextThought.model.Base',
    fields: [
        { name: 'Items', type: 'auto', defaultValue: {Items:[]}},
        { name: 'Class', type: 'string', defaultValue: 'Service'}
    ],


	getUserSearchURL: function(username){
		return _AppConfig.server.host + '/dataserver/UserSearch/'+(username||'');
	},


	getUserDataSearchURL: function(){
		var h = _AppConfig.server.host,
			u = _AppConfig.username;
		return h+'/dataserver/users/' +u+ '/Search/RecursiveUserGeneratedData/';
	},


	getSearchURL : function(containerId){
		var h = _AppConfig.server.host,
			c = containerId ? containerId : 'prealgebra';
		return h+'/'+c+'/Search/';
	},


	getPageItemURL: function(postFix){
		var h = _AppConfig.server.host,
			u = _AppConfig.username;
		return h+'/dataserver/users/'+u;
	},


	getStreamURL: function(){
		var h = _AppConfig.server.host,
			u = _AppConfig.username,
			containerId = 'aops-prealgebra-129';

		return  h+'/dataserver/users/'+u+'/Pages/' + containerId + '/RecursiveStream/';
	},


	getQuizSubmitURL: function(ntiid){
		var h = _AppConfig.server.host,
			u = _AppConfig.username;

		return  h+'/dataserver/users/'+u+'/quizresults/'+ntiid;
	},


	getWorkspace: function(name){
		var items = this.get('Items') || [],
			i, workspace = null;

		for(i in items){
			if(!items.hasOwnProperty(i))continue;
			if(items[i].Title == name){
				workspace = items[i];
				break;
			}
		}

		return workspace;
	},


	getLibrary: function(name){
		var libs = this.getWorkspace('Library') || {},
			items = libs.Items || [],
			i, library = null;

		for(i in items){
			if(!items.hasOwnProperty(i))continue;
			if(items[i].Title == name){
				library = items[i];
				break;
			}
		}

		return library;
	},


	getMainLibrary: function(){
		return this.getLibrary('Main') || {};
	}

});
