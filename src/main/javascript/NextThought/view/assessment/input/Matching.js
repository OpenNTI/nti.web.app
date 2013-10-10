Ext.define('NextThought.view.assessment.input.Matching',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-matchingpart-v3'

}, function(){
	if (isFeature('v3matching')) {
		this.addXtype('question-input-matchingpart');
	}
});
