Ext.define('NextThought.util.ExternalLibraries',{
	singleton: true,
	loadExternalLibraries: function (libs){
		if(window.libsLoaded){return;}
		Ext.each(libs, function(o){
			Ext.Object.each(o,function waiting(name,v){
				var cb = v && v.cb,
					url = (v && v.url) || v,
					waitFor = (v && v.waitFor) || false;

				if(waitFor && !window[waitFor]){
					Ext.defer(waiting,10,this,[name,v]);
					return;
				}

				Ext.Loader.loadScript({
					url: url,
					onError:function(){console.error(name+' failed to load');},
					onLoad:function(){
						Ext.callback(cb);
						console.debug(name+' loaded');
					}
				});
			});
		});
		window.libsLoaded = true;
	}


},function(){
	window.loadExternalLibraries = this.loadExternalLibraries;
	if(!window.libsLoaded){
		Ext.Loader.loadScript('javascript/libs.js');
	}
});
