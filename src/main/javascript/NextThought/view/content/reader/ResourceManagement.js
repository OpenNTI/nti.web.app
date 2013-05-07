Ext.define('NextThought.view.content.reader.ResourceManagement', function(){
	var manager;

	return {


		constructor: function(){
			var reader = this;
			manager = Ext.createByAlias('reader.resourceManager',reader);
		},


		getResourceManager: function(){
			return manager;
		}


	};
});


Ext.define('NextThought.view.content.reader.ResourceManager',{
	alias: 'reader.resourceManager',


	constructor: function(reader){
		this.reader = reader;
		reader.on('set-content','manage',this);
	},


	manage: function(reader, rawContent){

		console.log('Do Management stuff');

	}

});
