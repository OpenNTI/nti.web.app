const Ext = require('@nti/extjs');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

require('../Base');

module.exports = exports = Ext.define(
	'NextThought.model.courseware.CourseInstanceEnrollment',
	{
		extend: 'NextThought.model.Base',

		idProperty: 'href',
		fields: [
			{ name: 'CatalogEntry', type: 'singleItem', persist: false },
			{ name: 'Username', type: 'string' },
			{
				name: 'Status',
				type: 'string',
				mapping: 'LegacyEnrollmentStatus',
			},
			{ name: 'RealEnrollmentStatus', type: 'string' },
			{ name: 'VendorThankYouPage', type: 'auto' },
			{ name: 'CourseProgress', type: 'singleItem' },
		],

		__precacheEntry() {
			return Promise.resolve(this.getCourseCatalogEntry());
		},

		asUIData() {
			const e = this.getCourseCatalogEntry();
			const progress = this.get('CourseProgress');

			const data = {
				id: this.getId(),
				isCourse: true,
				author: e && e.getAuthorLine(),
				title: e && e.get('Title'),
				label: e && e.get('ProviderUniqueID'),
				semester: e && e.getSemesterBadge(),
				archived: e && e.isArchived(),
				upcoming: e && e.isUpcoming(),
				startDate: e && e.get('StartDate'),
				completed: progress && progress.get('Completed'),
				progress: progress && progress.get('PercentageProgress'),
			};

			return Ext.applyIf(data, {
				icon: e && e.get('icon'),
				thumb: e && e.get('thumb'),
			});
		},

		getIconImage() {
			this.getCourseCatalogEntry().getIconImage();
		},

		getCourseCatalogEntry() {
			return this.get('CatalogEntry');
		},

		async getCourseInstance() {
			if (this.__instance) {
				return this.__instance;
			}

			this.__instance = async (f, r) => {
				try {
					const resp = await Service.request(
						this.getLink('CourseInstance')
					);
					const inst = lazy.ParseUtils.parseItems(
						JSON.parse(resp)
					)[0];
					await inst.prepareData();

					return inst;
				} catch (e) {
					delete this.__instance;
					throw e;
				}
			};

			return this.__instance;
		},

		isOpen() {
			var status = this.get('Status');

			return status === 'Open';
		},
	}
);
