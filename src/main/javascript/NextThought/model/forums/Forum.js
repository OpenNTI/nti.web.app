Ext.define('NextThought.model.forums.Forum', {
	extend: 'NextThought.model.forums.Base',

	fields: [
		{ name: 'DCDescription', type: 'string' },
		{ name: 'DCTitle', type: 'string' },
		{ name: 'description', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'TopicCount', type: 'int', persist: false },
		{ name: 'NewestDescendant', type: 'singleitem'},
		{ name: 'ACL', type: 'auto'}
	],

	buildContentsStore: function (cfg, extraParams) {
		return this.callParent([Ext.apply({stateKey: 'forum'}, cfg),
								Ext.apply({
											  sorters: [
												  {
													  property:  'NewestDescendantCreatedTime',
													  direction: 'DESC'
												  }
											  ]
										  }, extraParams
								)]);
	}
});
