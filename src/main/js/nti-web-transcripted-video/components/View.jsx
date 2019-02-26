import React from 'react';
import PropTypes from 'prop-types';
import {Error, Loading} from '@nti/web-commons';
import {Component as Video} from '@nti/web-video';
import {decodeFromURI} from '@nti/lib-ntiids';
import classnames from 'classnames/bind';

import Store from '../Store';

import styles from './View.css';
import Gutter from './Gutter';
import Transcript from './Transcript';

const cx = classnames.bind(styles);

export default
@Store.connect([
	'loading',
	'error',
	'video',
	'slides',
	'notes',
	'transcript'
])
class View extends React.Component {

	static deriveBindingFromProps = ({course, videoId, outlineId}) => ({
		course,
		videoId: decodeFromURI(videoId),
		outlineId: decodeFromURI(outlineId)
	})

	static propTypes = {
		course: PropTypes.object.isRequired,
		videoId: PropTypes.string.isRequired,

		// store props
		loading: PropTypes.bool,
		error: PropTypes.any,
		video: PropTypes.object,
		slides: PropTypes.array,
		notes: PropTypes.array,
		transcript: PropTypes.shape({
			cues: PropTypes.arrayOf(
				PropTypes.shape({
					startTime: PropTypes.number.isRequired,
					endTime: PropTypes.number.isRequired,
					text: PropTypes.string.isRequired
				})
			)
			// transcript.regions not currently used
		})
	}

	render () {
		const {
			loading,
			error,
			video,
			transcript,
			// slides,
			notes
		} = this.props;

		const showError = error && !video;
		const showLoading = loading || !video;

		return (
			<div className={cx('transcripted-video')}>
				{
					showError
						? <Error error={error} />
						: showLoading
							? <Loading.Spinner />
							: (
								<>
									<Video src={video} />
									<Transcript transcript={transcript} />
									<Gutter notes={notes} />
								</>
							)
				}
			</div>
		);
	}
}
