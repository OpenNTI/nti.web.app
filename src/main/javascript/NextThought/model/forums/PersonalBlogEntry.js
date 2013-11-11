Ext.define('NextThought.model.forums.PersonalBlogEntry', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	mixins: {
		publishActions: 'NextThought.mixins.ModelWithPublish'
	},

	fields: [
		{name: 'FavoriteGroupingField', defaultValue: 'Thoughts', persist: false},
		{ name: 'sharedWith', type: 'UserList' }
	],

	getActivityLabel: function() {
		return 'shared a thought:';
	},

	//TODO: workaround for no-edit link
	isModifiable: function() {
		return isMe(this.get('Creator'));
	},

	isPublished: function() {
		return Boolean(this.getLink('unpublish'));
	},

	isUnPublished: function() {
		return Boolean(this.getLink('publish')) && Ext.isEmpty(this.get('sharedWith'));
	},

	isExplicit: function() {
		return Boolean(this.getLink('publish')) && !Ext.isEmpty(this.get('sharedWith'));
	},

	getSharingInfo: function() {
		var sharingInfo = {},
			entities = Ext.Array.filter(this.get('headline').get('tags'), function(t) {
				return ParseUtils.isNTIID(t);
			});

		if (this.isExplicit()) {
			sharingInfo = SharingUtils.tagShareToSharedInfo(this.get('sharedWith'), entities);
		}
		else if (this.isPublished()) {
			sharingInfo = {publicToggleOn: true, entities: entities};
		}else if (this.isUnPublished()) {
			sharingInfo = {publicToggleOn: false, entities: entities};
		}
		else {
			console.error('Record is not Published, Unpublished or Explicit ***DANGER, record: ', this);
		}

		return sharingInfo;
	}

});


