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
		{ name: 'applicableRange', type: 'ContentRangeDescription'},

		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'}
	],

	getActivityItemConfig: function(type, cid){
		var p = new Promise(), result = {};

		function getName(t) {

			function resolve(meta) {

				result.verb = 'Shared a ' + t;
				result.message = Ext.String.ellipsis(' in &ldquo' + ((meta || {}).label || ''), 50, true) + '&rdquo;';

				p.fulfill(result);
			}

			if (cid) {
				LocationMeta.getMeta(cid, resolve);
				return;
			}
			resolve(null);
		}

		console.error('does this branch (highlight and redaction) get called??');
		Ext.defer(getName, 1, this, [this.getModelName().toLowerCase()]);

		return p;
	}
});
