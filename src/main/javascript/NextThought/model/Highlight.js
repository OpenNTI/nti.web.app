Ext.define('NextThought.model.Highlight', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.anchorables.DomContentRangeDescription',
		'NextThought.model.converters.ContentRangeDescription'
	],

	fields: [
		{ name: 'sharedWith', type: 'UserList'},
		{ name: 'prohibitReSharing', type: 'boolean' },
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'tags', type: 'Auto'},
		{ name: 'selectedText', type: 'string'},
		{ name: 'style', type: 'string'},
		{ name: 'fillColor', type: 'string'},
		{ name: 'presentationProperties', type: 'auto'},
		{ name: 'applicableRange', type: 'ContentRangeDescription'},

		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'}
	],

	getActivityItemConfig: function(type, cid) {
		var t = this.getModelName().toLowerCase();

		console.error('does this branch (highlight and redaction) get called??');

		if (cid) {
			return LocationMeta.getMeta(cid)
					.then(function(meta) {
						return {
							verb: 'Shared a ' + t,
							message: Ext.String.ellipsis(' in &ldquo' + ((meta || {}).label || ''), 50, true) + '&rdquo;'
						};
					});
		}

		return Promise.resolve(null);
	}
});
