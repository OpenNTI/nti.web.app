const Ext = require('@nti/extjs');
const { Overview } = require('@nti/web-course');
const { getService } = require('@nti/web-client');
const CalendarEventRef = require('internal/legacy/model/calendar/CalendarEventRef');
const EditingActions = require('internal/legacy/app/course/overview/components/editing/Actions');

require('../../Editor');
require('internal/legacy/app/course/assessment/components/CreateMenu');

const getEventSVG = require('./eventIconUtil.js');

const Type = 'application/vnd.nextthought.courseware.coursecalendarevent';

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.event.Editor',
	{
		extend:
			'NextThought.app.course.overview.components.editing.content.Editor',
		alias: 'widget.overview-editing-event',

		statics: {
			getHandledMimeTypes: function () {
				return [CalendarEventRef.mimeType];
			},

			getTypes: function () {
				return [
					{
						title: 'Events',
						editorTitle: 'Add an Event',
						advanced: false,
						category: 'event',
						iconCls: 'event',
						hideFooter: true,
						description: '',
						editor: this,
						customHTML: getEventSVG(new Date().getDate()),
						isAvailable: async bundle => {
							const available = await bundle.getAvailableContentSummary();

							return available[Type];
						},
					},
				];
			},
		},
		LIST_XTYPE: 'overview-editing-event-selection',
		EDITOR_XTYPE: 'overview-editing-event-editor',
		backToList: 'Configured Tools',
		SWITCHED: 'switched',
		cls: 'content-editor content-event',

		afterRender: function () {
			this.callParent(arguments);
			this.EditingActions = new EditingActions();

			if (this.loading) {
				this.el.mask('Loading...');
			}
		},

		showEditor: async function () {
			this.loading = true;

			const lessonOverview = await this.rootRecord.getInterfaceInstance();
			const overviewGroup = await this.parentRecord.getInterfaceInstance();

			// we have to make sure the overview is the latest, otherwise we could have a stale list of sections
			await lessonOverview.refresh();

			let event = null;
			if (this.record) {
				event = await this.record.getInterfaceInstance();
			}

			const course = await this.bundle.getInterfaceInstance();

			this.loading = false;
			this.el.unmask();

			this.eventEditor = this.add({
				xtype: 'react',
				component: Overview.Items.Event.Editor,
				lessonOverview,
				overviewGroup,
				event,
				course,
				onDelete: event
					? () => {
							this.parentRecord
								.removeRecord(this.record)
								.then(function () {
									return true;
								})
								.catch(function (reason) {
									console.error(
										'Failed to delete content: ',
										reason
									);
									return false;
								})
								.then(Promise.minWait(200))
								.then(() => {
									this.doClose();
								});
					  }
					: null,
				onCancel: () => {
					if (this.doClose) {
						this.doClose();
					}
				},
				onAddToLesson: (
					selectedSection,
					selectedRank,
					img,
					selectedEvent
				) => {
					if (this.doSave) {
						try {
							this.eventEditor.setProps({ saveDisabled: true });

							this.event = selectedEvent;
							this.selectedParent = null;

							// refresh root record in case a new section was created and chosen
							this.rootRecord.updateFromServer().then(updated => {
								updated.get('Items').forEach(item => {
									if (
										selectedSection.getID() === item.getId()
									) {
										this.selectedParent = item;
									}
								});

								this.selectedRank = selectedRank - 1;
								this.img = img;

								this.doSave();
							});
						} catch (e) {
							if (this.eventEditor) {
								this.eventEditor.setProps({
									saveDisabled: false,
								});
							}
						}
					}
				},
			});
		},

		onBack: function () {
			if (this.itemEditorCmp) {
				this.showItemList([this.itemEditorCmp.selectedItem]);
			} else if (this.doBack) {
				this.doBack();
			}
		},

		maybeEnableBack: function (text) {
			if (!this.record && this.enableBack) {
				this.enableBack(text);
			}
		},

		onSaveFailure: function (reason) {
			if (reason === this.SWITCHED) {
				return;
			}

			this.callParent(arguments);
		},

		onSave: function () {
			let originalPosition = {};

			if (this.record) {
				let index = 0;

				this.parentRecord.get('Items').forEach((i, idx) => {
					if (i.getId() === this.record.getId()) {
						index = idx;
					}
				});

				originalPosition = {
					parent: this.parentRecord,
					index,
				};
			}

			const currentPosition = {
				parent: this.selectedParent,
				index: this.selectedRank,
			};

			const formData = new FormData();

			formData.append('MimeType', CalendarEventRef.mimeType);
			formData.append('target', this.event.getID());

			return getService()
				.then(service => {
					if (this.record) {
						return service.put(
							this.record.getLink('edit'),
							formData
						);
					}

					return service.post(
						this.selectedParent.getLink('ordered-contents') +
							'/index/' +
							this.selectedRank,
						formData
					);
				})
				.then(raw => {
					if (this.record) {
						this.record.syncWithResponse(raw);
					}

					if (this.record) {
						return this.EditingActions.__moveRecord(
							this.record,
							originalPosition,
							currentPosition,
							this.rootRecord
						);
					}

					return Promise.resolve();
				})
				.then(() => {
					if (this.record) {
						return this.record.fireEvent('update');
					}

					return Promise.resolve();
				})
				.then(() => {
					this.doClose();

					this.eventEditor.setProps({ saveDisabled: false });
				})
				.catch(() => {
					this.eventEditor.setProps({ saveDisabled: false });
				});
		},
	}
);
