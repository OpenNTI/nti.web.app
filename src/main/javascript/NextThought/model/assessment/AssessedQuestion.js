Ext.define('NextThought.model.assessment.AssessedQuestion', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	idProperty: 'questionId',
	fields: [
		{ name: 'questionId', type: 'string' },
		{ name: 'parts', type: 'arrayItem' }
	],


	isCorrect: function(){
		var p = this.get('parts')||[];
		var i = p.length-1;
		for(; i>=0; i--){
			if(!p[i].isCorrect()){
				return false;
			}
		}

		return true;
	}
});
