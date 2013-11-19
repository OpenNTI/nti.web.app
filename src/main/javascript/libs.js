loadExternalLibraries([
	{'Duration': 'resources/lib/duration.js'},//https://github.com/leadhead9/durationjs
	{'Stripe': 'https://js.stripe.com/v1/'},
	{'Flash API': 'resources/lib/swfobject.js'},
	{'Zoom Detection': 'resources/lib/detect-zoom.js'},
	{'jQuery': 'resources/lib/jQuery-1.8.0min.js'},
	{'jQuery NoConflict': {url: 'resources/lib/jQuery-noconflict.js', waitFor: 'jQuery'}},
	{'MathQuill': {url: 'resources/lib/mathquill/mathquill.min.js', waitFor: 'jQuery'}},
	{'jQuery.payment': {url: 'resources/lib/jquery.payment.js', waitFor: 'jQuery'}},
	{'rangy': 'resources/lib/rangy-1.3alpha.681/rangy-core.js'},
	{'Rangy TextRange': {
		url: 'resources/lib/rangy-1.3alpha.681/rangy-textrange.js',
		waitFor: 'rangy',
		cb: function() {rangy.init();}
	}}
]);
