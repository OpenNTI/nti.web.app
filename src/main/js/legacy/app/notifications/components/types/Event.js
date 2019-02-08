const Ext = require('@nti/extjs');

const WindowActions = require('legacy/app/windows/Actions');

require('./Base');

module.exports = exports = Ext.define('NextThought.app.notifications.components.types.Event', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-event',

	statics: {
		mimeType: 'application/vnd.nextthought.courseware.coursecalendarevent'
	},

	itemCls: 'event',

	createdWording: 'created an event {name}',
	updatedWording: 'updated an event {name}',


	isCreated () {
		const type = this.change && this.change.get('ChangeType');

		return type === 'Created';
	},


	fillInWording () {
		const title = this.titleTpl.apply({name: this.record.get('title')});
		const wording = this.isCreated() ?
			this.createdWording.replace('{name}', title) :
			this.updatedWording.replace('{name}', title);

		if (this.wordingEl && this.wordingEl.dom) {
			this.wordingEl.dom.innerHTML = wording;
		}
	},

	onClicked () {
		//TODO: once we have a library path use that to navigate to the event instead of just opening the window
		const actions = WindowActions.create();

		actions.pushWindow(this.record);

		if (this.hideNotifications) {
			this.hideNotifications();
		}
	}
});
