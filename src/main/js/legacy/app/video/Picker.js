const Ext = require('extjs');

const {EmbedInput, createMediaSourceFromUrl, getCanonicalUrlFrom} = require('nti-web-video');
const PromptStateStore = require('legacy/app/prompt/StateStore');
const Video = require('legacy/model/Video');

const SourceMimeType = 'application/vnd.nextthought.ntivideosource';

require('legacy/overrides/ReactHarness');

function createSource (media) {
	return Promise.all([
			media.getPoster(),
			media.getThumbnail()
		]).then(([poster, thumbnail]) => {
			debugger;
		});
}

function createVideo (media) {
	return Promise.all([
		createSource(media),
		media.getTitle()
	]).then(([sources, title]) => {

		debugger;
	});
}

module.exports = exports = Ext.define('NextThought.app.video.Picker', {
	extend: 'Ext.container.Container',
	alias: 'widget.video-picker-prompt',

	cls: 'video-picker-prompt',

	layout: 'none',
	items: [],


	initComponent () {
		this.callParent(arguments);

		this.Prompt.Header.hide();
		this.Prompt.Footer.hide();

		this.add({
			xtype: 'react',
			component: EmbedInput,
			onSelect: src => this.onSelect(src),
			onDismiss: () => this.onDismiss()
		});
	},


	onSelect (source) {
		createMediaSourceFromUrl(getCanonicalUrlFrom(source))
			.then((media) => {
				return createVideo(media);
			});
	},


	onDismiss () {
		this.Prompt.doClose();
	}
}, function () {
	PromptStateStore.register('video-picker', this);
});
