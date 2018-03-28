const Ext = require('extjs');
const {ProgressWidgets} = require('nti-web-course');

const DEFAULT = 'Default';
const REQUIRED = 'Required';
const OPTIONAL = 'Optional';

module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.VideoRollItem', {
	extend: 'Ext.container.Container',

	alias: 'widget.course-overview-videoroll-item',

	bubbleEvents: ['requiredValueChanged'],

	initComponent: function () {
		this.callParent(arguments);

		const targetId = this.video.get('Target-NTIID') || this.video.get('NTIID');

		const onChange = async (value) => {
			const encodedID = encodeURIComponent(targetId);

			const completionPolicy = this.courseInstance.get('CompletionPolicy');

			const requirementLink = completionPolicy.getLink('Required');
			const nonRequirementLink = completionPolicy.getLink('NotRequired');

			if(value === REQUIRED) {
				await Service.put(requirementLink, {
					ntiid: targetId
				});

				await Service.requestDelete(nonRequirementLink + '/' + encodedID);
			}
			else if(value === OPTIONAL) {
				await Service.put(nonRequirementLink, {
					ntiid: targetId
				});

				await Service.requestDelete(requirementLink + '/' + encodedID);
			}
			else if(value === DEFAULT) {
				await Service.requestDelete(requirementLink + '/' + encodedID);
				await Service.requestDelete(nonRequirementLink + '/' + encodedID);
			}

			this.courseInstance.get('CompletionPolicy').fireEvent('requiredValueChanged', { ntiid: targetId, value });
		};

		if(this.courseInstance.get('CompletionPolicy')) {
			this.courseInstance.get('CompletionPolicy').on('requiredValueChanged', ({ntiid, value}) => {
				if(this.requireControl && targetId === ntiid) {
					this.requireControl.setProps({value});
				}
			});
		}

		let container = this.add({
			xtype: 'container',
			cls: 'video-row',
			items: [
				{
					xtype: 'component',
					html: `<span class="label" data-qtip="${Ext.String.htmlEncode(this.video.get('label'))}">${this.video.get('label')}</span>`
				},
				{
					xtype: 'component',
					cls: 'viewed',
					html: 'viewed'
				}
			]
		});

		const isCompletableObject = this.courseInstance.get('CompletionPolicy');

		if(this.inEditMode && isCompletableObject) {
			const transformed = {
				IsCompletionDefaultState: this.video.get('IsCompletionDefaultState'),
				CompletionRequired: this.video.get('CompletionRequired'),
				CompletionDefaultState: this.video.get('CompletionDefaultState')
			};

			this.requireControl = container.add({
				xtype: 'react',
				component: ProgressWidgets.RequirementControl,
				className: 'videoroll-item',
				record: transformed,
				onChange
			});

			// this.requireControl = container.add({
			// 	xtype: 'react',
			// 	cls: 'required-control',
			// 	component: SelectBox,
			// 	value: requiredValue,
			// 	onChange,
			// 	showSelectedOption: true,
			// 	options: [
			// 		{ label: DEFAULT + ' (' + defaultValue + ')', value: DEFAULT },
			// 		{ label: REQUIRED, value: REQUIRED },
			// 		{ label: OPTIONAL, value: OPTIONAL }
			// 	]
			// });
		}
		else if(!this.inEditMode && isCompletableObject && this.video.get('CompletionRequired')) {
			container.add({
				xtype: 'component',
				cls: 'required-value',
				html: REQUIRED
			});
		}

		this.on('requiredValueChanged', () => {
			// sync value to any other with same target ID
		});
	},


	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	handleClick: function (e) {
		if(e.getTarget('.require-control-value')) {
			return;
		}

		if (this.selectVideo) {
			this.selectVideo(this.video);
		}
	},


	setProgress: function (progress) {
		if (progress.hasBeenViewed(this.video.getId())) {
			this.addCls('hasBeenViewed');
		}
	}
});
