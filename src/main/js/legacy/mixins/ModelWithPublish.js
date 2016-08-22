var Ext = require('extjs');
var ParseUtils = require('../util/Parsing');
var SharingUtils = require('../util/Sharing');

function getConfigForPost (url, course) {
	return course ? {url, params: {course}} : url;
}


module.exports = exports = Ext.define('NextThought.mixins.ModelWithPublish', {

	getPublishState: function () {
		return this.isPublished() ? 'Public' : 'Only Me';
	},


	canPublish () {
		return this.hasLink('publish');
	},


	canUnpublish () {
		return this.hasLink('unpublish');
	},


	isExplicit: function () {
		return this.hasLink('publish') && !Ext.isEmpty(this.get('sharedWith'));
	},


	isPublishedByState () {
		return this.get('PublicationState') === 'DefaultPublished';
	},


	isPublished: function () {
		return this.hasLink('unpublish') ||
				this.get('PublicationState') === 'DefaultPublished';
	},

	isDraft: function () {
		return this.get('PublicationState') !== 'DefaultPublished';
	},

	publish: function (widget, cb, scope) {
		var me = this,
			currentValue = this.isPublished(),
			action = currentValue ? 'unpublish' : 'publish';

		if ((me.activePostTos && me.activePostTos[action]) || me.phantom) {return;}

		widget = widget || {};//default it so we don't blow up if no arg is passed

		//We will assume it completes and then update it if it actually fails
		//The callback expects key/value pair as argument.
		Ext.callback(widget.markAsPublished, widget, ['publish', !currentValue]);

		me.postTo(action, function (s) {
			Ext.callback(cb, scope || window, [me, s]);
			if (!s) {
				Ext.callback(widget.markAsPublished, widget, ['publish', currentValue]);
			}
		});

	},


	getSharingInfo: function () {
		var sharingInfo,
			entities = Ext.Array.filter(this.get('headline').get('tags'), function (t) {
				return ParseUtils.isNTIID(t);
			});

		if (this.isExplicit()) {
			sharingInfo = SharingUtils.tagShareToSharedInfo(this.get('sharedWith'), entities);
		}
		else {
			sharingInfo = {publicToggleOn: this.isPublished(), entities: entities};
		}

		return sharingInfo;
	},


	doPublish (data, context) {
		if (!this.canPublish()) {
			return Promise.reject('Unable to publish');
		}

		const link = this.getLink('publish');

		return Service.post(getConfigForPost(link, context), data || {})
			.then((response) => {
				this.syncWithResponse(response);
			});
	},


	doUnpublish (data, context) {
		if (!this.canUnpublish()) {
			return Promise.reject('Unable to unpublish');
		}

		const link = this.getLink('unpublish');

		return Service.post(getConfigForPost(link, context), data || {})
			.then((response) => {
				this.syncWithResponse(response);
			});
	}
});
