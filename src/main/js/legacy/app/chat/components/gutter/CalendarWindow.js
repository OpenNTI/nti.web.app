const Ext = require('@nti/extjs');
const { Calendar } = require('@nti/web-calendar');

const WindowsActions = require('legacy/app/windows/Actions');
const CalendarRoutes = require('legacy/app/CalendarRoutes');
require('legacy/mixins/Router');
require('./EventWindow');

module.exports = exports = Ext.define(
	'NextThought.app.chat.components.gutter.EventWindow',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.gutter-list-calendar-window',
		cls: 'gutter-calendar-window',

		mixins: {
			Router: 'NextThought.mixins.Router',
		},

		layout: 'none',

		initComponent() {
			this.callParent(arguments);

			this.initRouter();

			this.WindowActions = WindowsActions.create();

			this.add({
				xtype: 'react',
				component: Calendar,
				onClose: () => {
					this.onClose();
				},
				addHistory: true,
				getRouteFor: CalendarRoutes(this),
			});
		},
	}
);
