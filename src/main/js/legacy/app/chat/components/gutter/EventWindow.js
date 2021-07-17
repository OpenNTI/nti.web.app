const Ext = require('@nti/extjs');
const { Models } = require('@nti/lib-interfaces');
const { Event: EventComponent } = require('@nti/web-calendar');
const { GotoWebinar } = require('@nti/web-integrations');
const WindowsStateStore = require('internal/legacy/app/windows/StateStore');
const WindowsActions = require('internal/legacy/app/windows/Actions');

require('internal/legacy/overrides/ReactHarness');

const styles = stylesheet`
	.legacy-window {
		max-height: calc(90vh - var(--navigation-top, 0));
	}
`;

module.exports = exports = Ext.define(
	'NextThought.app.chat.event.Window',
	{
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

			if (obj.MimeType === Models.integrations.Webinar.MimeType) {
				if (obj.hasLink('WebinarRegister')) {
					this.add({
						xtype: 'react',
						component: GotoWebinar.Registration,
						item: { webinar: obj },
						onBeforeDismiss: () => {
							this.WindowActions.closeWindow();
						},
					});
				}
			} else {
				this.add({
					xtype: 'react',
					component: EventComponent.View,
					event: obj,
					onCancel: () => {
						this.WindowActions.closeWindow();
					},
					dialog: false,
					editable: obj.hasLink('edit'),
					className: styles.legacyWindow,
				});
			}
		},
	},
	function () {
		WindowsStateStore.register(
			Models.calendar.CourseCalendarEvent.MimeType,
			this
		);
		WindowsStateStore.register(
			Models.calendar.AssignmentCalendarEvent.MimeType,
			this
		);
		WindowsStateStore.register(Models.integrations.Webinar.MimeType, this);
	}
);
