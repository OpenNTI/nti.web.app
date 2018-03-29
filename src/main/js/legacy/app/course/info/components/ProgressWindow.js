const Ext = require('extjs');
const {parseNTIID} = require('nti-lib-ntiids');
const {getService} = require('nti-web-client');
const {Progress} = require('nti-web-course');

require('legacy/overrides/ReactHarness');
const Base64 = require('legacy/util/Base64');
const WindowActions = require('legacy/app/windows/Actions');
const WindowsStateStore = require('legacy/app/windows/StateStore');
const ContextStore = require('legacy/app/context/StateStore');

const MimeType = 'application/vnd.nextthought.webapp.roster-progress';

function getWindowObject (course, index, currentFilter, filterProperty, filterValue, sortOn, sortDirection) {
	const obj = {
		isModel: true,
		addMimeTypeToRoute: true,
		mimeType: MimeType,
		courseId: course.getId ? course.getId() : course.getID(),
		index,
		currentFilter,
		filterProperty,
		filterValue,
		sortOn,
		sortDirection
	};

	return {
		...obj,
		course,
		getId: () => Base64.encodeURLFriendly(JSON.stringify(obj))
	};
}

module.exports = exports = Ext.define('NextThought.app.forums.components.topic.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.roster-progress-window',

	statics: {
		getWindowObject (...args) {
			return getWindowObject(...args);
		}
	},

	layout: 'none',
	cls: 'progress-overview-window',


	initComponent () {
		this.callParent(arguments);

		this.WindowActions = WindowActions.create();
		this.ContextStore = ContextStore.getInstance();

		this.setFullScreen();

		this.showProgress(this.record);
	},


	async resolveCourse () {
		if (this.course) { return this.course; }

		const {courseId} = this.record;
		const rootBundle = this.ContextStore.getRootBundle();

		try {
			const service = await getService();
			const course = rootBundle.getId() === courseId ?
				await rootBundle.getInterfaceInstance() :
				await service.getObject(courseId);

			this.course = course;

			return this.course;
		} catch (e) {
			return null;
		}
	},


	getBatchLink (course) {
		const {index, currentFilter, filterProperty, filterValue, sortOn, sortDirection} = this.record;
		const rosterURL = course &&  course.getLink('CourseEnrollmentRoster');

		let url = `${rosterURL}?batchSize=1&batchStart=${index}`;

		if (currentFilter) {
			url = `${url}&filter=LegacyEnrollmentStatus${currentFilter}`;
		}

		if (filterProperty && filterValue) {
			url = `${url}&${filterProperty}=${filterValue}`;
		}

		if (sortOn) {
			url = `${url}&sortOn=${sortOn}&sortOrder=${sortDirection === 'DESC' ? 'descending' : 'ascending'}`;
		}

		return url;
	},


	async showProgress () {
		const course = await this.resolveCourse();
		const batchLink = this.getBatchLink(course);

		this.removeAll(true);

		this.add({
			xtype: 'react',
			component: Progress.Overview,
			course,
			batchLink,
			onDismiss: () => this.onDismiss()
		});
	},


	onDismiss () {
		global.history.go(-1);
	}
}, function () {
	WindowsStateStore.register(MimeType, this);
	WindowsStateStore.registerCustomResolver(MimeType, async function (id) {
		const {specific: {type: data} = {}} = parseNTIID(id) || {};

		if (!data) {
			return null;
		}

		return JSON.parse(Base64.decodeURLFriendly(data));
	});
});
