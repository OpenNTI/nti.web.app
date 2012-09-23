Ext.define('NextThought.model.PageInfo', {
	extend: 'NextThought.model.Base',
	idProperty: 'ID',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing',
		'NextThought.model.assessment.Question'
	],
	fields: [
		{ name: 'AssessmentItems', type: 'arrayItem' },
		{ name: 'sharingPreference', type: 'auto' },
		{ name: 'dataFilterPreference', type: 'auto' }
	],


	getSubContainerURL: function(rel,id){
		var url = this.getLink(rel),
			enCi = encodeURIComponent(this.get('NTIID')),
			enId = encodeURIComponent(id);

		return url.replace(enCi,enId);
	}
});
