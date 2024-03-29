const Ext = require('@nti/extjs');
const { CourseMenu } = require('@nti/web-course');
const { Prompt } = require('@nti/web-commons');
const { getService } = require('@nti/web-client');
const {
	getString,
	getFormattedString,
} = require('internal/legacy/util/Localization');
const EnrollmentStateStore = require('internal/legacy/app/course/enrollment/StateStore');
const EnrollmentActions = require('internal/legacy/app/course/enrollment/Actions');
const CoursesStateStore = require('internal/legacy/app/library/courses/StateStore');

require('internal/legacy/overrides/ReactHarness');

module.exports = exports = Ext.define(
	'NextThought.app.library.courses.components.settings.CourseMenu',
	{
		extend: 'Ext.menu.Menu',
		alias: 'widget.course-menu',
		cls: 'user-course-menu',
		width: 260,

		defaults: {
			ui: 'nt-menuitem',
			xtype: 'menuitem',
			plain: true,
		},

		afterRender: function () {
			this.callParent(arguments);

			const catalog = this.course && this.course.getCourseCatalogEntry();
			if (catalog) {
				catalog.on('dropped', this.onDrop.bind(this, catalog));
			}
		},

		onDrop(catalog) {
			const courseTitle = catalog && catalog.get('Title');

			Ext.Msg.show({
				msg: getFormattedString(
					'NextThought.view.courseware.enrollment.Details.dropped',
					{
						course: courseTitle,
					}
				),
				title: 'Done',
				icon: 'success',
			});
		},

		resolveCatalogEntry: function () {
			return getService().then(service => {
				return service.getObject(
					this.course.getCourseCatalogEntry().get('NTIID')
				);
			});
		},

		updateStore: function (updatedCatalogEntry) {
			this.CourseStore.fireEvent(
				'modified-course',
				updatedCatalogEntry,
				this.collectionEl
			);
		},

		deleteCourse: function () {
			var me = this;

			Prompt.areYouSure('')
				.then(() => {
					return getService();
				})
				.then(service => {
					return service.getObject(me.course.getId());
				})
				.then(courseInstance => {
					me.collectionEl.mask('Deleting...');
					return courseInstance
						.delete('delete')
						.then(() => {
							return true;
						})
						.catch(resp => {
							if (resp && resp.message) {
								alert(resp.message);
							} else {
								alert(
									"You don't have permission to delete this course"
								);
							}
							return false;
						});
				})
				.then(success => {
					me.collectionEl.unmask();

					if (success) {
						me.updateStore();
					}
				});
		},

		addMask: function () {
			try {
				var maskEl = this.el && this.el.up('.body-container');
				if (maskEl) {
					maskEl.mask('Loading...');
				}
			} catch (e) {
				console.warn('Error masking. %o', e);
			}
		},

		removeMask: function () {
			try {
				var maskEl = this.el && this.el.up('.body-container');
				if (maskEl) {
					maskEl.unmask();
				}
			} catch (e) {
				console.warn('Error unmasking. %o', e);
			}
		},

		dropCourse: function () {
			const me = this;
			const catalog = this.course.getCourseCatalogEntry();
			const courseTitle = catalog && catalog.get('Title');

			function undoEnrollment(cmp) {
				return new Promise(function (fulfill, reject) {
					cmp.CourseEnrollmentActions.dropEnrollment(
						catalog,
						function (success, changed, status) {
							if (success) {
								fulfill(changed);
							} else {
								reject(status);
							}
						}
					);
				});
			}

			me.changingEnrollment = true;

			Ext.Msg.show({
				msg: getFormattedString(
					'NextThought.view.courseware.enrollment.Details.DropDetails',
					{ course: courseTitle }
				),
				title: getString(
					'NextThought.view.courseware.enrollment.Details.AreSure'
				),
				icon: 'warning-red',
				buttons: {
					primary: {
						text: getString(
							'NextThought.view.courseware.enrollment.Details.DropCourse'
						),
						cls: 'caution',
						handler: function () {
							me.addMask();
							undoEnrollment(me).catch(function (reason) {
								var msg;

								if (reason === 404) {
									msg = getString(
										'NextThought.view.courseware.enrollment.Details.AlreadyDropped'
									);
								} else if (reason.status === 403) {
									msg =
										reason.message ||
										getString(
											'NextThought.view.courseware.enrollment.Details.ProblemDropping'
										);
								} else {
									msg = getString(
										'NextThought.view.courseware.enrollment.Details.ProblemDropping'
									);
								}

								console.error('failed to drop course', reason);
								//already dropped?? -- double check the string to make sure it's correct
								setTimeout(() => {
									alert(msg);
								}, 500);
							});
						},
					},
					secondary: {
						text: getString(
							'NextThought.view.courseware.enrollment.Details.DropCancel'
						),
					},
				},
			});
		},

		initComponent: function () {
			this.callParent(arguments);

			this.CourseEnrollmentStore = EnrollmentStateStore.getInstance();
			this.CourseEnrollmentActions = EnrollmentActions.create();
			this.CourseStore = CoursesStateStore.getInstance();

			var catalogEntry = this.course.getCourseCatalogEntry();

			var registered =
				this.CourseEnrollmentStore.getEnrolledText(catalogEntry);

			var me = this,
				menuCfg = {
					xtype: 'react',
					component: CourseMenu,
					course: this.course,
					registered,
				};

			// assume delete link means admin and not delete means drop enrollment option?
			if (this.course.hasLink('delete')) {
				menuCfg.onEdit = () => {
					me.hide();
					me.goToRecord && me.goToRecord(me.record, 'info');
				};
			}

			if (this.course.hasLink('Export')) {
				menuCfg.onExport = () => {
					me.hide();

					window.location.href = this.course.getLink('Export');
				};
			}

			if (catalogEntry.isDroppable()) {
				menuCfg.onDrop = () => {
					me.hide();
					me.dropCourse();
				};
			}

			if (this.course.hasLink('delete')) {
				menuCfg.onDelete = () => {
					me.hide();
					me.deleteCourse();
				};
			}

			this.add(menuCfg);
		},
	}
);
