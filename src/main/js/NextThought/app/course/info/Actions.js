Ext.define('NextThought.app.course.info.Actions', {
	extend: 'NextThought.common.Actions',

	openEnrollmentWindow: function(catalogEntry) {
		var ntiid = catalogEntry.getId();

		ntiid = ParseUtils.encodeForURI(ntiid);

		return Promise.resolve('/library/courses/available/' + ntiid);
	}
});
