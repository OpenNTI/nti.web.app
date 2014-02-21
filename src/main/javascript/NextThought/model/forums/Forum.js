Ext.define('NextThought.model.forums.Forum', {
	extend: 'NextThought.model.forums.Base',

	fields: [
		{ name: 'DCDescription', type: 'string' },
		{ name: 'DCTitle', type: 'string' },
		{ name: 'description', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'TopicCount', type: 'int', persist: false },
		{ name: 'NewestDescendant', type: 'singleitem' },
		{ name: 'NewestDescendantCreatedTime', type: 'date', persist: false, dateFormat: 'timestamp', defaultVale: new Date() },
		{ name: 'ACL', type: 'auto'}
	],

	buildContentsStore: function(idSuffix, cfg, extraParams) {
		return this.callParent([idSuffix, Ext.apply({stateKey: 'forum'},cfg),
			Ext.apply({
				sorters: [{
					property: 'NewestDescendantCreatedTime',
					direction: 'DESC'
				}]
			},extraParams
		)]);
	}
});
