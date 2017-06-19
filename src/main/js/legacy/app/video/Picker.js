const Ext = require('extjs');
const {getService} = require('nti-web-client');

const {EmbedInput, Editor, createMediaSourceFromUrl, getCanonicalUrlFrom} = require('nti-web-video');
const PromptStateStore = require('legacy/app/prompt/StateStore');
const Video = require('legacy/model/Video');

const SourceMimeType = 'application/vnd.nextthought.ntivideosource';

const Types = {
	'kaltura': 'video/kaltura',
	'youtube': 'video/youtube',
	'vimeo': 'video/vimeo'
};

require('legacy/overrides/ReactHarness');

function createSources ({service, source}) {
	return [{
		MimeType: SourceMimeType,
		service,
		source: [source],
		type: [Types[service]]
	}];
}

function createVideoJSON (media) {
	return Promise.all([
		createSources(media),
		media.getTitle()
	]).then(([sources, title]) => {

		return {
			MimeType: Video.mimeType,
			title,
			sources
		};
	});
}

function createVideo (link, raw) {
	if (!link) { return Promise.reject(); }

	return getService()
			.then((service) => service.postParseResponse(link, raw));
}


function getVideo (video) {
	debugger;
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

		const {video} = this.Prompt.data;

		if (video) {
			getVideo()
				.then(video => this.editVideo(video));
		} else {
			this.createVideo();
		}
	},


	getAssetLink () {
		const {data} = this.Prompt;

		return data && data.bundle && data.bundle.getLink('assets');
	},


	createPlaceholderVideo (raw) {
		return {...raw, save: (...args) => this.onPlaceholderSaved(...args)};
	},


	onPlaceholderSaved () {
		debugger;
	},


	editVideo (video) {
		if (this.videoCreator) {
			this.videoCreator.destroy();
		}

		this.videoEditor = this.add({
			xtype: 'react',
			component: Editor,
			video,
			onDone: () => this.onVideoEdit()
		});
	},


	createVideo () {
		if (this.videoEditor) {
			this.videoEditor.destroy();
		}

		this.videoCreator = this.add({
			xtype: 'react',
			component: EmbedInput,
			onSelect: src => this.onNewVideoSelect(src),
			onCancel: () => this.onCancel()
		});
	},


	onNewVideoSelect (source) {
		createMediaSourceFromUrl(getCanonicalUrlFrom(source))
			.then(media => createVideoJSON(media))
			.then(raw => this.createPlaceholderVideo(raw))
			.then((placeholder) => this.editVideo(placeholder));
	},


	onCancel () {
		this.Prompt.doClose();
	}
}, function () {
	PromptStateStore.register('video-picker', this);
});
