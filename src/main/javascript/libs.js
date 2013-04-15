loadExternalLibraries([
	{"Stripe":"https://js.stripe.com/v1/"},
	{"YouTube API":"https://www.youtube.com/iframe_api"},
	{"Flash API":"resources/lib/swfobject.js"},
	{"Zoom Detection":"resources/lib/detect-zoom.js"},
	{"jQuery":"resources/lib/jQuery-1.8.0min.js"},
	{"jQuery NoConflict":{url:"resources/lib/jQuery-noconflict.js", waitFor: "jQuery"}},
	{"MathQuill":{url:"resources/lib/mathquill/mathquill.min.js", waitFor: "jQuery"}},
	{"rangy":"resources/lib/rangy-1.3alpha.681/rangy-core.js"},
	{"Rangy TextRange":{
		url:"resources/lib/rangy-1.3alpha.681/rangy-textrange.js",
		waitFor:"rangy",
		cb:function(){rangy.init();}
	}}
]);
