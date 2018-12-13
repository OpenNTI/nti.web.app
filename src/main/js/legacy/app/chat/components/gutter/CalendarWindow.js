const Ext = require('@nti/extjs');
const {Calendar} = require('@nti/web-calendar');
const {Models} = require('@nti/lib-interfaces');

const Base = require('legacy/model/Base');
const WindowsActions = require('legacy/app/windows/Actions');

require('legacy/mixins/Router');
require('./EventWindow');

module.exports = exports = Ext.define('NextThought.app.chat.components.gutter.EventWindow', {
	extend: 'Ext.container.Container',
	alias: 'widget.gutter-list-calendar-window',
	cls: 'gutter-calendar-window',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	initComponent () {
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
			getRouteFor: (obj, context) => {
				if (obj.MimeType === Models.calendar.CourseCalendarEvent.MimeType) {
					return () => {
						if(this.onItemClick) {
							this.onItemClick(obj);
						}

						this.WindowActions.pushWindow(Base.interfaceToModel(obj));
					};
				}
				else if(obj.MimeType === Models.calendar.WebinarCalendarEvent.MimeType) {
					if(obj.hasLink('JoinWebinar')) {
						// needed to avoid decoding spaces in history module's createLocation (used in routing)
						let testAnchor = document.createElement('a');
						testAnchor.href = obj.getLink('JoinWebinar');

						return {
							href: testAnchor.href,
							target: '_blank'
						};
					}
					else if(obj.hasLink('WebinarRegister')) {
						return async () => {
							const webinar = await obj.fetchLinkParsed('Webinar');

							if(this.onItemClick) {
								this.onItemClick(obj);
							}

							if(obj.hasLink('WebinarRegister')) {
								this.WindowActions.pushWindow(Base.interfaceToModel(webinar));
							}
						};
					}
					else {
						return () => {
							alert('This webinar is no longer available');
						};
					}
				}
				else if(obj.MimeType === Models.calendar.AssignmentCalendarEvent.MimeType) {
					return async () => {
						let libraryPathObject = null;

						if(obj.MimeType.match(/assignment/)) {
							libraryPathObject = await obj.fetchLinkParsed('Assignment');
						}

						if(this.onItemClick) {
							this.onItemClick(obj);
						}

						this.navigateToObject(Base.interfaceToModel(libraryPathObject));
					};
				}
			}
		});
	}
});
