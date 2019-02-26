import React from 'react';
import PropTypes from 'prop-types';

export default class Transcript extends React.Component {
	static propTypes = {
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
		return (
			<div>
				(transcript)
			</div>
		);
	}
}
