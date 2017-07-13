const Ext = require('extjs');
const {getService} = require('nti-web-client');

const {getLink, Server, Service} = require('nti-lib-interfaces');
const {EmbedInput, Editor, createMediaSourceFromUrl, getCanonicalUrlFrom} = require('nti-web-video');
const ParseUtils = require('legacy/util/Parsing');
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
	return getService()
		.then(service => service.getObject(video instanceof Object && video.get ? video.get('ntiid') : video))
		.then(v => {
			v.save = v.save || function ({title}) {
				v.title = title;
				const link = getLink(v, 'edit');
				const service = v[Service];
				const server = service && service[Server];
				if (!server) {
					Promise.reject();
				}

				return server.put(link, v).then(o => Promise.resolve(o));
			};

			return v;
		});
}


function parseVideo (video) {
	return ParseUtils.parseItems(video)[0];
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
				.then(v => {
					this.video = v;
					this.editVideo(v);
				});
		} else {
			this.createVideo();
		}
	},


	getAssetLink () {
		const {data} = this.Prompt;

		return data && data.bundle && data.bundle.getLink('assets');
	},


	createPlaceholderVideo (raw) {
		this.placeholderVideo = {...raw, save: (...args) => this.onPlaceholderSaved(raw, ...args)};

		return this.placeholderVideo;
	},


	onPlaceholderSaved (raw, data) {
		return createVideo(this.getAssetLink(), {...raw, ...data})
			.then((v) => {
				this.placeholderVideo = v;
			});
	},


	editVideo (video) {
		if (this.videoCreator) {
			this.videoCreator.destroy();
		}

		this.videoEditor = this.add({
			xtype: 'react',
			component: Editor,
			video,
			onSave: v => this.onVideoSave(v),
			onCancel: () => this.doClose()
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
		createMediaSourceFromUrl(getCanonicalUrlFrom(source))
			.then(media => createVideoJSON(media))
			.then(raw => this.createPlaceholderVideo(raw))
			.then((placeholder) => this.editVideo(placeholder));
	},


	onVideoSave () {
		const video = this.placeholderVideo ?
							parseVideo(this.placeholderVideo) :
							this.video;

		this.Prompt.doImmediateSave(video);
	},



	doClose () {
		this.Prompt.doClose();
	}
}, function () {
	PromptStateStore.register('video-picker', this);
});
