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

		const onChange = () => {
			// TODO: Hit courseInstance link for setting required/optional
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

		// TODO: Check courseInstance.getLink for relevant required/optional link.  If there is no link, assume that's not supported for this course
		if(this.inEditMode) {
			container.add({
				xtype: 'react',
				cls: 'required-control',
				component: SelectBox,
				value: DEFAULT,	// TODO: pull the actual value from the video record
				onChange,
				showSelectedOption: true,
				options: [
					{ label: DEFAULT, value: DEFAULT },
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
