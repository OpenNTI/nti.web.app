loadExternalLibraries([
	{'Flash API': 'resources/lib/swfobject.js'},

	{'jQuery': 'resources/lib/jQuery-1.8.0min.js'},
	{'jQuery NoConflict': {url: 'resources/lib/jQuery-noconflict.js', waitFor: 'jQuery'}},

	{'MathQuill': {url: 'resources/lib/mathquill/mathquill.min.js', waitFor: 'jQuery'}},

	{'Stripe': 'https://js.stripe.com/v1/'},
	{'jQuery.payment': {url: 'resources/lib/jquery.payment.js', waitFor: 'jQuery'}},

	{'Timeline': {
		url: 'resources/lib/timeline/js/storyjs-embed.js',
		waitFor: 'jQuery'
	}}
]);
