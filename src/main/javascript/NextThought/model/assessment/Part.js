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
			dom = new DOMParser().parseFromString(this.get('content'),"text/xml");

		Ext.each(dom.querySelectorAll('object.naqvideo'),function(i){
			out.push({
				video: i.getElementsByName('url')[0].getAttribute('value'),
				thumb: i.getElementsByName('thumbnail')[0].getAttribute('value')
			});
		});

		return out;
	}
});
