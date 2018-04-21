const Ext = require('@nti/extjs');
const {getService} = require('@nti/web-client');
const {EmbedInput, Editor, createMediaSourceFromUrl, getCanonicalUrlFrom} = require('@nti/web-video');

const PromptStateStore = require('legacy/app/prompt/StateStore');
const Video = require('legacy/model/Video');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));

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

function getVideo (video) {
	return getService()
		.then(service => service.getObject(video instanceof Object && video.get ? video.get('ntiid') : video));
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

		if (video && !(video instanceof Object)) {
			getVideo(video)
				.then(v => this.editVideo(v));
		} else {
			this.createVideo();
		}
	},


	editVideo (video) {
		if (this.videoCreator) {
			this.videoCreator.destroy();
		}

		const {onVideoDelete} = this.Prompt.data;

		getService()
			.then(service => {
				Promise.all(video.transcripts
					? video.transcripts.map((transcript) => service.getObjectRaw(transcript.NTIID))
					: [])
					.then((transcripts) => {
						this.videoEditor = this.add({
							xtype: 'react',
							component: Editor,
							video,
							transcripts,
							onSave: v => this.onVideoSave(v),
							onCancel: reason => this.doClose(reason),
							onVideoDelete
						});
					});
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
			onCancel: () => this.doClose()
		});
	},


	onNewVideoSelect (source) {
		const { data } = this.Prompt;
		const link = data && data.bundle && data.bundle.getLink('assets');

		createMediaSourceFromUrl(getCanonicalUrlFrom(source))
			.then(media => createVideoJSON(media))
			.then((video) => getService().then((service) => service.postParseResponse(link, video)))
			.then((video) => this.editVideo(video));
	},


	onVideoSave (video) {
		this.Prompt.doImmediateSave(lazy.ParseUtils.parseItems(video)[0]);
	},


	doClose (reason) {
		this.Prompt.doClose(reason);
	}
}, function () {
	PromptStateStore.register('video-picker', this);
});
