const Ext = require('@nti/extjs');
const { Models } = require('@nti/lib-interfaces');
const { Event: EventComponent } = require('@nti/web-calendar');
const { GotoWebinar } = require('@nti/web-integrations');
const WindowsStateStore = require('internal/legacy/app/windows/StateStore');
const WindowsActions = require('internal/legacy/app/windows/Actions');

require('internal/legacy/overrides/ReactHarness');

const styles = stylesheet`
	/* dialogs put the given class name on the mask and the content, we want to target the content*/
	.legacy-window .legacy-window {
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
					addRouteTo: true,
					addHistory: true,
					component: EventComponent.View,
					event: obj,
					onCancel: () => {
						this.WindowActions.closeWindow();
					},
					// This is letting the Event view launch as a dialog, even though this is a window already, because the React code can manage stacking better
					dialog: true,
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
