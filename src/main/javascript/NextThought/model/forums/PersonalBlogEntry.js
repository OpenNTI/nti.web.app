Ext.define('NextThought.model.forums.PersonalBlogEntry', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	mixins: {
		publishActions: 'NextThought.mixins.ModelWithPublish'
	},

	fields: [
		{name: 'FavoriteGroupingField', defaultValue: 'Thoughts', persist: false},
		{ name: 'sharedWith', type: 'UserList' }
	],

	getActivityLabel: function () {
		return 'shared a thought:';
	},

	//TODO: workaround for no-edit link
	isModifiable:     function () {
		return isMe(this.get('Creator'));
	},

	isPublished: function () {
		return Boolean(this.getLink('unpublish'));
	},

	isUnPublished: function () {
		return Boolean(this.getLink('publish')) && Ext.isEmpty(this.get('sharedWith'));
	},

	isExplicit: function () {
		return Boolean(this.getLink('publish')) && !Ext.isEmpty(this.get('sharedWith'));
	},

	getSharingInfo: function () {
		var sharingInfo = {};
		if (this.isExplicit()) {
			sharingInfo = SharingUtils.sharedWithToSharedInfo(this.get('sharedWith'));
		}
		else if (this.isPublished()) {
			sharingInfo = {publicToggleOn: true, entities: []};
		} else if (this.isUnPublished()) {
			sharingInfo = {publicToggleOn: false, entities: []};
		}
		else {
			console.error('Record is not Published, Unpublished or Explicit ***DANGER, record: ', this);
		}

		return sharingInfo;
	}

});


