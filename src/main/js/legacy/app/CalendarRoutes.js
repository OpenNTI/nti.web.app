const { Models } = require('@nti/lib-interfaces');

const Base = require('legacy/model/Base');
const WinActions = require('legacy/app/windows/Actions');

module.exports = exports = function calendarRoutes(scope) {
	const { WindowActions = WinActions.create() } = scope;

	const handlers = {
		[Models.calendar.CourseCalendarEvent.MimeType]: (obj, context) => {
			return function () {
				if (scope.onItemClick) {
					scope.onItemClick(obj);
				}

				WindowActions.pushWindow(Base.interfaceToModel(obj));
			};
		},

		[Models.calendar.WebinarCalendarEvent.MimeType]: (obj, context) => {
			if (obj.hasLink('JoinWebinar')) {
				// needed to avoid decoding spaces in history module's createLocation (used in routing)
				let testAnchor = document.createElement('a');
				testAnchor.href = obj.getLink('JoinWebinar');

				return {
					href: testAnchor.href,
					target: '_blank',
				};
			} else if (obj.hasLink('WebinarRegister')) {
				return async () => {
					const webinar = await obj.fetchLinkParsed('Webinar');

					if (scope.onItemClick) {
						scope.onItemClick(obj);
					}

					if (obj.hasLink('WebinarRegister')) {
						WindowActions.pushWindow(
							Base.interfaceToModel(webinar)
						);
					}
				};
			} else {
				return () => {
					alert('This webinar is no longer available');
				};
			}
		},

		[Models.calendar.AssignmentCalendarEvent.MimeType]: function (
			obj,
			context
		) {
			return async () => {
				let libraryPathObject = null;

				if (obj.MimeType.match(/assignment/)) {
					libraryPathObject = await obj.fetchLinkParsed('Assignment');
				}

				if (scope.onItemClick) {
					scope.onItemClick(obj);
				}

				scope.navigateToObject(
					Base.interfaceToModel(libraryPathObject)
				);
			};
		},
	};

	return function (obj, context) {
		const handler = handlers[obj.MimeType];
		return handler ? handler(obj, context) : null;
	};
};
