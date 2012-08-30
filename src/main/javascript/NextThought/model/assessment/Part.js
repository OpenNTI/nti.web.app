Ext.define('NextThought.model.assessment.Part', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields: [
		{ name: 'content', type: 'string' },
		{ name: 'hints', type: 'arrayItem' },
		{ name: 'solutions', type: 'arrayItem' },
		{ name: 'explanation', type: 'string' }
	],


	getVideos: function(){
		var out = [],
			dom = new DOMParser().parseFromString(this.get('content'),"text/xml"),
			objects = dom.querySelectorAll('object.naqvideo');



		return out;
	}
});
