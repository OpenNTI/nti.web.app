Ext.define('NextThought.model.assessment.Part', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields: [
		{ name: 'content', type: 'string' },
		{ name: 'hints', type: 'arrayItem' },
		{ name: 'solutions', type: 'arrayItem', limit:1 },
		{ name: 'explanation', type: 'string' },
		{ name: 'answerLabel', type: 'string' }
	],


	getVideos: function(){
		var out = [],
			dom = new DOMParser().parseFromString(this.get('content'),"text/xml");

		Ext.each(dom.querySelectorAll('object.naqvideo'),function(i){
			var o = {};
			Ext.each(i.getElementsByTagName('param'),function(p){
				o[p.getAttribute('name')] = p.getAttribute('value');
			});
			out.push(o);
		});

		return out;
	}
});
