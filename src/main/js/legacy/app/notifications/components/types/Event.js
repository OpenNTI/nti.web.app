const Ext = require('@nti/extjs');

require('./Base');

module.exports = exports = Ext.define(
	'NextThought.app.notifications.components.types.Event',
	{
		extend: 'NextThought.app.notifications.components.types.Base',
		alias: 'widget.notifications-item-event',

		statics: {
			mimeType:
				'application/vnd.nextthought.courseware.coursecalendarevent',
		},

		itemCls: 'event',

		createdWording: 'created an event {name}',
		updatedWording: 'updated an event {name}',

		isCreated() {
			const type = this.change && this.change.get('ChangeType');

			return type === 'Created';
		},

		fillInWording() {
			const title = this.titleTpl.apply({
				name: Ext.util.Format.htmlEncode(this.record.get('title')),
			});
			const wording = this.isCreated()
				? this.createdWording.replace('{name}', title)
				: this.updatedWording.replace('{name}', title);

			if (this.wordingEl && this.wordingEl.dom) {
				this.wordingEl.dom.innerHTML = wording;
			}
		},
	}
);
