Ext.define('NextThought.mixins.ModelWithPublish', {

	getPublishState: function() {
		return this.isPublished() ? 'Public' : 'Only Me';
	},


	isExplicit: function() {
		return this.hasLink('publish') && !Ext.isEmpty(this.get('sharedWith'));
	},


	isPublished: function() {
		return this.hasLink('unpublish') ||
			   this.get('PublicationState') === 'DefaultPublished';
	},


	publish: function(widget, cb, scope) {
		var me = this,
			currentValue = this.isPublished(),
			action = currentValue ? 'unpublish' : 'publish';

		if ((me.activePostTos && me.activePostTos[action]) || me.phantom) {return;}

		widget = widget || {};//default it so we don't blow up if no arg is passed

		//We will assume it completes and then update it if it actually fails
		//The callback expects key/value pair as argument.
		Ext.callback(widget.markAsPublished, widget, ['publish', !currentValue]);

		me.postTo(action, function(s) {
			Ext.callback(cb, scope || window, [me, s]);
			if (!s) {
				Ext.callback(widget.markAsPublished, widget, ['publish', currentValue]);
			}
		});

	},


	getSharingInfo: function() {
		var sharingInfo,
			entities = Ext.Array.filter(this.get('headline').get('tags'), function(t) {
				return ParseUtils.isNTIID(t);
			});

		if (this.isExplicit()) {
			sharingInfo = SharingUtils.tagShareToSharedInfo(this.get('sharedWith'), entities);
		}
		else {
			sharingInfo = {publicToggleOn: this.isPublished(), entities: entities};
		}

		return sharingInfo;
	}
});
