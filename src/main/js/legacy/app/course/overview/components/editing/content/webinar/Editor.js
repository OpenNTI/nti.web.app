const Ext = require('@nti/extjs');
const {Overview} = require('@nti/web-course');
const {getService} = require('@nti/web-client');

const WebinarAsset = require('legacy/model/WebinarAsset');
const EditingActions = require('legacy/app/course/overview/components/editing/Actions');

const ContentlinkEditor = require('../contentlink/types/URL');
require('../../Editor');
require('legacy/app/course/assessment/components/CreateMenu');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.webinar.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-webinar',

	statics: {
		getHandledMimeTypes: function () {
			return [
				WebinarAsset.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Webinar',
					editorTitle: 'Add a Webinar',
					advanced: false,
					category: 'webinar',
					iconCls: 'webinar',
					hideFooter: true,
					description: '',
					editor: this
				}
			];
		}
	},
	LIST_XTYPE: 'overview-editing-webinar-selection',
	EDITOR_XTYPE: 'overview-editing-webinar-editor',
	backToList: 'Configured Tools',
	SWITCHED: 'switched',
	cls: 'content-editor content-webinar',

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

		let webinar = null;
		if(this.record) {
			webinar = await this.record.getInterfaceInstance();
		}

		const course = await this.bundle.getInterfaceInstance();

		this.loading = false;
		this.el.unmask();

		this.webinarEditor = this.add({
			xtype: 'react',
			component: Overview.Items.Webinar.Editor,
			lessonOverview,
			overviewGroup,
			webinar,
			course,
			onDelete: webinar ? () => {
				this.parentRecord.removeRecord(this.record)
					.then(function () {
						return true;
					})
					.catch(function (reason) {
						console.error('Failed to delete content: ', reason);
						return false;
					})
					.then(Promise.minWait(200))
					.then(() => { this.doClose(); });
			} : null,
			onCancel: () => {
				if(this.doClose) {
					this.doClose();
				}
			},
			onAddToLesson: (selectedSection, selectedRank, img, selectedWebinar) => {
				if(this.doSave) {
					this.webinarEditor.setProps({saveDisabled: true});

					this.webinar = selectedWebinar;
					this.selectedParent = null;

					// refresh root record in case a new section was created and chosen
					this.rootRecord.updateFromServer().then((updated) => {
						updated.get('Items').forEach(item => {
							if(selectedSection.getID() === item.getId()) {
								this.selectedParent = item;
							}
						});

						this.selectedRank = selectedRank - 1;
						this.img = img;

						this.doSave();
					});
				}
			},
			onAddAsExternalLink: (url) => {
				// switch over to external link editor
				this.showFooter();
				this.switchType(ContentlinkEditor.getTypes()[0], { url, title: 'Webinar'});
			}
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
		if (reason === this.SWITCHED) { return; }

		this.callParent(arguments);
	},

	onSave: function () {
		let originalPosition = {};

		if(this.record) {
			let index = 0;

			this.parentRecord.get('Items').forEach((i, idx) => {
				if(i.getId() === this.record.getId()) {
					index = idx;
				}
			});

			originalPosition = {
				parent: this.parentRecord,
				index
			};
		}

		const currentPosition = {
			parent: this.selectedParent,
			index: this.selectedRank
		};

		const formData = new FormData();

		formData.append('MimeType', 'application/vnd.nextthought.webinarasset');
		formData.append('webinar', this.webinar.webinarKey);
		formData.append('organizerKey', this.webinar.organizerKey);

		if(this.img !== undefined) {
			formData.append('icon', this.img || null);
		}

		return getService().then(service => {
			if(this.record) {
				return service.put(this.record.getLink('edit'), formData);
			}

			return service.post(this.selectedParent.getLink('ordered-contents') + '/index/' + this.selectedRank, formData);
		}).then(() => {
			if(this.record) {
				return this.EditingActions.__moveRecord(this.record, originalPosition, currentPosition, this.rootRecord);
			}

			return Promise.resolve();
		}).then(() => {
			if(this.record) {
				return this.record.fireEvent('update');
			}

			return Promise.resolve();
		}).then(() => {
			this.doClose();

			this.webinarEditor.setProps({saveDisabled: false});
		}).catch(() => {
			this.webinarEditor.setProps({saveDisabled: false});
		});
	}
});