import {WebVTT, VTTCue} from 'vtt.js';
import {Stores} from '@nti/lib-store';
import {Logger} from '@nti/util-logger';

const logger = Logger.get('transcripted-video:store');

function parseTranscript (vtt) {
	const parser = new WebVTT.Parser(global, WebVTT.StringDecoder());
	const cues = [];
	const regions = [];

	parser.oncue = cue => cues.push(cue);
	parser.onregion = region => regions.push(region);
	parser.onparsingerror = e => throw e;

	//Safari has a native VTTCue but it doesn't honor auto (which is in the spec)
	//so for now just force it to use the poly-fill
	const oldVTTCue = global.VTTCue;

	try {
		global.VTTCue = VTTCue;

		parser.parse(vtt);
		parser.flush();
	} finally {
		global.VTTCue = oldVTTCue;
	}

	return {cues, regions};
}


export default class VideoStore extends Stores.BoundStore {

	loadTranscript = async video => {
		const locale = this.get('locale') || 'en';
		return video.getTranscript(locale)
			.then(parseTranscript);
	}

	getSlides = (video, mediaIndex) => {
		const {slidedecks} = video || {};

		if (!(slidedecks || []).length) {
			return;
		}

		const decks = slidedecks.filter(x => mediaIndex.get(x));

		if (!decks.length) {
			logger.warn('Referenced slidedecks do not exist in scope. %o %o', video, mediaIndex);
			return;
		}

		if (decks.length > 1) {
			logger.warn('Multiple slidedecks for video: %o %o', video.getID(), decks.join(', '));
		}

		// last one wins
		return mediaIndex.get(decks.pop());
	}

	async load () {
		const {
			course,
			videoId,
			outlineId
		} = this.binding || {};

		if (!course || !videoId) {
			return;
		}

		let loading = true, error, video, slides, transcript, notes;

		this.set({
			loading,
			error,
			video,
			slides,
			transcript,
			notes
		});

		try {
			const mediaIndex = await course.getMediaIndex()
				.then(index => index.scoped(outlineId));
	
			video = mediaIndex.get(videoId);
			slides = this.getSlides(video, mediaIndex);

			[transcript, notes] = await Promise.all([
				this.loadTranscript(video),
				this.loadNotes(video)
			]);
		}
		catch (e) {
			error = e;
		}

		this.set({
			loading: false,
			error,
			video,
			slides,
			transcript,
			notes
		});
	}
}
