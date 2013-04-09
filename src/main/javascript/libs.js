(function(){
	var libs = [
		{'YouTube API':'https://www.youtube.com/iframe_api'},
		{'Flash API':'resources/lib/swfobject.js'},
		{'Zoom Detection':'resources/lib/detect-zoom.js'},
		{'MathQuill':'resources/lib/mathquill/mathquill.min.js'},
		{'Rangy':'resources/lib/rangy-1.3alpha.681/rangy-core.js'},
		{'Rangy TextRange':{
			url:'resources/lib/rangy-1.3alpha.681/rangy-textrange.js',
			waitFor:'rangy',
			cb:function rangyReady(){
				if(!window.rangy || !rangy.modules.TextRange){
					setTimeout(rangyReady, 100);
					return;
				}
				rangy.init();
			}
		}}
	];

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
					console.log(name+' loaded');
				}
			});
		});
	});
}());
