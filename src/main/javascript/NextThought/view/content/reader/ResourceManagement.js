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

	YOU_TUBE_API_KEY: 'YT',
	YOU_TUBE_IFRAME_QUERY: 'iframe[src*="youtube.com"]',
	YOU_TUBE_BLOCKED_TPL: Ext.DomHelper.createTemplate({
		cls: 'youtube blocked video',
		html: 'YouTube appears to be blocked by your connection.'
	}),


	constructor: function(reader){
		this.reader = reader;
		reader.on('set-content','manage',this,{delay:1});
	},


	manage: function(reader, rawContent){
		this.manageYouTubeVideos();
	},


	manageYouTubeVideos: function(){
		var d,items, tpl = this.YOU_TUBE_BLOCKED_TPL;

		if(window[this.YOU_TUBE_API_KEY] !== undefined){
			return;
		}

		d = this.reader.getDocumentElement();
		items = d.querySelectorAll(this.YOU_TUBE_IFRAME_QUERY);

		Ext.each(items,function(i){
			tpl.insertBefore(i);
			Ext.fly(i).remove();
		});
	}

});
