var Ext = require('extjs');
var TypesBase = require('./Base');


module.exports = exports = Ext.define('NextThought.app.notifications.components.types.Note', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-note',

	statics: {
		mimeType: 'application/vnd.nextthought.note'
	},

	showCreator: true,
	wording1: 'shared a note',
	wording2: 'commented on a note',
	wording3: 'shared a note: {title}',


	fillInWording: function() {
		var item = this.record,
			wording;

		if (item.get('inReplyTo') || (item.get('references') || []).length > 0) {
			wording = this.wording2;
		} else if (item.get('title')) {
			wording = this.wording3.replace('{title}', this.titleTpl.apply({name: item.get('title')}));
		} else {
			wording = this.wording1;
		}

		if (this.wordingEl && this.wordingEl.dom) {
			this.wordingEl.dom.innerHTML = wording;
		}
	}
});
