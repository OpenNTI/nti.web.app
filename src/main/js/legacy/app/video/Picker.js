const Ext = require('extjs');
const {getService} = require('nti-web-client');
const {getLink, Server, Service: ServiceSymbol} = require('nti-lib-interfaces');
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

function saveVideo (video, {title}) {
	video.title = title;
	const link = getLink(video, 'edit');
	const service = video[ServiceSymbol];
	const server = service && service[Server];
	if (!server) {
		Promise.reject();
	}

	return server.put(link, video);
}

function getVideo (video) {
	return getService()
		.then(service => service.getObject(video instanceof Object && video.get ? video.get('ntiid') : video));
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
					this.video = this.createVideoForEdit(v);
					this.editVideo(this.video);
				});
		} else {
			this.createVideo();
		}
	},


	getAssetLink () {
		const {data} = this.Prompt;

		return data && data.bundle && data.bundle.getLink('assets');
	},

	createVideoForEdit (raw) {
		this.placeholderVideo = null;

		return {
			...raw,
			save: (...args) => saveVideo(raw, ...args).then(video => {
				this.video = video;
				return video;
			}),
			applyCaptions: (video, captionsFile) => this.applyCaptions(video, captionsFile),
			replaceTranscript: (transcript, newFile) => this.replaceTranscript(transcript, newFile),
			removeTranscript: (transcript) => this.removeTranscript(transcript)
		};
	},

	createPlaceholderVideo (raw) {
		this.placeholderVideo = {
			...raw,
			save: (...args) => this.onPlaceholderSaved(raw, ...args),
			update: (r, ...args) => saveVideo(r, ...args),
			applyCaptions: (video, captionsFile) => this.applyCaptions(video, captionsFile)
		};

		return this.placeholderVideo;
	},

	applyCaptions (video, captionsFile) {
		if(captionsFile) {
			const transcriptLinks = video.Links.filter((l) => l.rel === 'transcript');
			if(transcriptLinks.length === 1) {
				const url = transcriptLinks[0].href;
				const formdata = new FormData();
				formdata.append(captionsFile.name, captionsFile);
				return Service.postMultiPartData(url, formdata);
			}
			return Promise.reject('No transcript link');
		}
	},

	replaceTranscript (transcript, newFile) {
		if(transcript) {
			const url = transcript.href;
			const formdata = new FormData();
			formdata.append(newFile.name, newFile);
			return Service.putMultiPartData(url, formdata);
		}
	},

	removeTranscript (transcript) {
		if(transcript) {
			return Service.requestDelete(transcript.href);
		}
	},

	onPlaceholderSaved (raw, data) {
		return createVideo(this.getAssetLink(), {...raw, ...data})
			.then((v) => {
				this.placeholderVideo = v;
				return v;
			});
	},


	editVideo (video) {
		if (this.videoCreator) {
			this.videoCreator.destroy();
		}

		const normalTranscripts = video && video.transcripts && video.transcripts.filter((t) => t.purpose === 'normal');

		if(normalTranscripts && normalTranscripts.length > 1) {
			// no transcript case
			this.videoEditor = this.add({
				xtype: 'react',
				component: Editor,
				video,
				badTranscriptState: true,
				onSave: v => this.onVideoSave(v),
				onCancel: () => this.doClose()
			});
		}
		else if(normalTranscripts && normalTranscripts.length === 1) {
			// existing transcript case
			getService()
				.then(service => service.getObjectRaw(normalTranscripts[0].NTIID)
					.then((transcript) => {
						this.videoEditor = this.add({
							xtype: 'react',
							component: Editor,
							video,
							transcript,
							onSave: v => this.onVideoSave(v),
							onCancel: () => this.doClose()
						});
					})
				);
		}
		else {
			// no transcript case
			this.videoEditor = this.add({
				xtype: 'react',
				component: Editor,
				video,
				onSave: v => this.onVideoSave(v),
				onCancel: () => this.doClose()
			});
		}
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
		const video = this.placeholderVideo
			? parseVideo(this.placeholderVideo)
			: this.video;

		this.Prompt.doImmediateSave(video);
	},



	doClose () {
		this.Prompt.doClose();
	}
}, function () {
	PromptStateStore.register('video-picker', this);
});
