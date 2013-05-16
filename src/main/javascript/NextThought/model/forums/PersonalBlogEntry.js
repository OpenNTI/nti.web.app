Ext.define('NextThought.model.forums.PersonalBlogEntry', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	mixins:{
		publishActions: 'NextThought.mixins.ModelWithPublish'
	},

	fields:[
		{name: 'FavoriteGroupingField', defaultValue:'Thoughts', persist: false},
		{ name: 'sharedWith', type: 'UserList' }
	],

	getActivityLabel: function(){
		return 'shared a thought:';
	},

	//TODO: workaround for no-edit link
	isModifiable: function(){
		return isMe(this.get('Creator'));
	}

});


