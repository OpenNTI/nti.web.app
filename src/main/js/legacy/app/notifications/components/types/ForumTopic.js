const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.notifications.components.types.ForumTopic', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-forum-topic',

	statics: {
		mimeType: [
			'application/vnd.nextthought.forums.communityheadlinetopic',
			'application/vnd.nextthought.forums.contentheadlinetopic',
			'application/vnd.nextthought.forums.dflheadlinetopic'
		]
	},

	wording: 'created a discussion {title:htmlEncode}',


	fillInWording: function () {
		var wording = this.wording;

		wording = wording.replace('{title:htmlEncode}', this.titleTpl.apply({name: this.record.get('title')}));

		if (this.wordingEl && this.wordingEl.dom) {
			this.wordingEl.dom.innerHTML = wording;
		}
	}

});
