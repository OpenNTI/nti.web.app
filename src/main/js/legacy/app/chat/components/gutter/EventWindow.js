const Ext = require('@nti/extjs');
const {Models} = require('@nti/lib-interfaces');
const {Editor} = require('@nti/web-calendar');
const {GotoWebinar} = require('@nti/web-integrations');

const WindowsStateStore = require('legacy/app/windows/StateStore');
const WindowsActions = require('legacy/app/windows/Actions');

require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.chat.event.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.calendar-event-window',
	layout: 'none',

	cls: 'calendar-event-window',

	initComponent: function () {
		this.callParent(arguments);

		this.WindowActions = WindowsActions.create();

		this.addContent();
	},

	addContent: async function () {
		const obj = await this.record.getInterfaceInstance();

		if(obj.MimeType === Models.integrations.Webinar.MimeType) {
			if(obj.hasLink('WebinarRegister')) {
				this.add({
					xtype: 'react',
					component: GotoWebinar.Registration,
					item: { webinar: obj },
					onBeforeDismiss: () => {
						this.WindowActions.closeWindow();
					}
				});
			}
		}
		else {
			this.add({
				xtype: 'react',
				component: Editor,
				event: obj,
				getAvailableCalendars: () => [],
				onCancel: () => {
					this.WindowActions.closeWindow();
				}
			});
		}
	}

}, function () {
	WindowsStateStore.register(Models.calendar.CourseCalendarEvent.MimeType, this);
	WindowsStateStore.register(Models.calendar.AssignmentCalendarEvent.MimeType, this);
	WindowsStateStore.register(Models.integrations.Webinar.MimeType, this);

});
