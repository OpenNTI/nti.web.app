const Ext = require('@nti/extjs');

const CourseCatalogEntry = require('./CourseCatalogEntry');
require('./CourseInstance');
require('./ScormCourseMetadata');

module.exports = exports = Ext.define('NextThought.model.courses.ScormInstance', {
	extend: 'NextThought.model.courses.CourseInstance',
	mimeType: 'application/vnd.nextthought.courses.scormcourseinstance',
	static: {
		mimeType: 'application/vnd.nextthought.courses.scormcourseinstance'
	},
	isScormCourse: true,

	fields: [
		{ name: 'Metadata', type: 'singleItem' }
	],

	__precacheEntry: function () {
		var p = this.precachePromise,
			me = this,
			Cls = CourseCatalogEntry;

		if (!p) {
			this.precachePromise = new Promise(function (fulfill, reject) {
				var url = me.getLink('CourseCatalogEntry');

				if (!url) {
					return reject('Course Instance (' + me.getId() + ') has a null link for "CourseCatalogEntry".');
				}

				Cls.load(null, {
					url: url,
					callback: function (rec) {
						rec.stores.push(me);

						me.__courseCatalogEntry = rec;
						if (rec) {
							rec.get('Links').getRelLink('CourseInstance').href = me.get('href');
							me.set('Preview', rec.get('Preview'));
							rec.set('enrolled', true);//if we come from here, we are enrolled.
							me.afterEdit(['NTIID']);//let views know the record "changed".
							fulfill(rec);
						} else {
							reject('No Record, See logs');
						}
					}
				});
			});

			p = this.precachePromise;
		}

		return p;
	},


	getContentPackageContaining () {
		return Promise.reject('No Content Packages in a scorm course.');
	},


	asUIData: function () {
		var e = this.getCourseCatalogEntry();

		return {
			id: this.getId(),
			isCourse: true,
			icon: e && e.get('icon'),
			thumb: e && e.get('thumb'),
			author: e && e.getAuthorLine(),
			title: e && e.get('Title'),
			label: e && e.get('ProviderUniqueID'),
			semester: e && e.getSemesterBadge(),
			archived: e && e.isArchived(),
			upcoming: e && e.isUpcoming(),
			startDate: e && e.get('StartDate')
		};
	},

	getPresentationProperties: function (id) {
		const cce = this.getCourseCatalogEntry();
		return cce.getPresentationProperties && cce.getPresentationProperties(id);
	},

	getBackgroundImage: function () {
		const cce = this.getCourseCatalogEntry();
		return cce.getBackgroundImage && cce.getBackgroundImage();
	},

	getIconImage: function () {
		const cce = this.getCourseCatalogEntry();
		return cce.getIconImage && cce.getIconImage();
	},

	getThumbnail: function () {
		const cce = this.getCourseCatalogEntry();
		return (cce.getThumbnail && cce.getThumbnail()) || Promise.resolve('');
	},

	getVendorIconImage: function () {
		const cce = this.getCourseCatalogEntry();
		return (cce.getVendorIcon && cce.getVendorIcon()) || Promise.resolve('');
	}
});
