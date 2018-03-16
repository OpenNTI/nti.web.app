const Ext = require('extjs');
const {SelectBox} = require('nti-web-commons');

const DEFAULT = 'Default';
const REQUIRED = 'Required';
const OPTIONAL = 'Optional';

module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.VideoRollItem', {
	extend: 'Ext.container.Container',

	alias: 'widget.course-overview-videoroll-item',

	initComponent: function () {
		this.callParent(arguments);

		const onChange = (value) => {
			const id = this.video.get('Target-NTIID') || this.video.get('NTIID');
			const encodedID = encodeURIComponent(id);

			if(value === REQUIRED) {
				Service.put(this.courseInstance.getLink('CompletionRequired'), {
					ntiid: id
				});

				Service.requestDelete(this.courseInstance.getLink('CompletionNotRequired') + '/' + encodedID);
			}
			else if(value === OPTIONAL) {
				Service.put(this.courseInstance.getLink('CompletionNotRequired'), {
					ntiid: id
				});

				Service.requestDelete(this.courseInstance.getLink('CompletionRequired') + '/' + encodedID);
			}
			else if(value === DEFAULT) {
				Service.requestDelete(this.courseInstance.getLink('CompletionRequired') + '/' + encodedID);
				Service.requestDelete(this.courseInstance.getLink('CompletionNotRequired') + '/' + encodedID);
			}
		};

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

		if(this.inEditMode && this.courseInstance.hasLink('CompletionRequired') && Object.keys(this.video.rawData).includes('CompletionRequired')) {
			const basedOnDefault = this.video.get('IsCompletionDefaultState');
			const isRequired = this.video.get('CompletionRequired');
			const requiredValue = basedOnDefault ? DEFAULT : isRequired ? REQUIRED : OPTIONAL;
			const defaultValue = this.video.get('CompletionDefaultState') ? REQUIRED : OPTIONAL;

			container.add({
				xtype: 'react',
				cls: 'required-control',
				component: SelectBox,
				value: requiredValue,
				onChange,
				showSelectedOption: true,
				options: [
					{ label: DEFAULT + ' (' + defaultValue + ')', value: DEFAULT },
					{ label: REQUIRED, value: REQUIRED },
					{ label: OPTIONAL, value: OPTIONAL }
				]
			});
		}
		else {
			container.add({
				xtype: 'component',
				cls: 'required-value',
				html: 'Required'
			});
		}
	},


	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	handleClick: function (e) {
		if(e.getTarget('.required-control')) {
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
