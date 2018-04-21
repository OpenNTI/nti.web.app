const Ext = require('@nti/extjs');
('./Part');


module.exports = exports = Ext.define('NextThought.model.assessment.ModeledContentPart', {
	extend: 'NextThought.model.assessment.Part',
	mimeType: [
		'application/vnd.nextthought.assessment.modeledcontentpart',
		'application/vnd.nextthought.assessment.nongradablemodeledcontentpart'
	],
	fields: []
});
