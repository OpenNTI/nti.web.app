loadExternalLibraries([
	{'Formatter': 'resources/lib/formatter.min.js'},//http://firstopinion.github.io/formatter.js/
	{'XRegExp': 'resources/lib/xregexp-all-min.js'},//https://github.com/slevithan/xregexp
	{'Stripe': 'https://js.stripe.com/v1/'},
	{'Flash API': 'resources/lib/swfobject.js'},

	{'jQuery': 'resources/lib/jQuery-1.8.0min.js'},
	{'jQuery NoConflict': {url: 'resources/lib/jQuery-noconflict.js', waitFor: 'jQuery'}},
	{'MathQuill': {url: 'resources/lib/mathquill/mathquill.min.js', waitFor: 'jQuery'}},
	{'jQuery.payment': {url: 'resources/lib/jquery.payment.js', waitFor: 'jQuery'}},

	{'rangy': 'resources/lib/rangy-1.3alpha.681/rangy-core.js'},
	{'Rangy TextRange': {
		url: 'resources/lib/rangy-1.3alpha.681/rangy-textrange.js',
		waitFor: 'rangy',
		cb: function() {rangy.init();}
	}},
	{'Timeline': {
		url: 'resources/lib/timeline/js/storyjs-embed.js',
		waitFor: 'jQuery'
	}}
]);
