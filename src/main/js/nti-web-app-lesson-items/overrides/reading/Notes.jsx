import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {NoteSummary, FillToBottom} from '@nti/web-commons';

import Styles from './Notes.css';

const cx = classnames.bind(Styles);

export default class NTIWebAppLessonItemsReadingNotes extends React.Component {
	static propTypes = {
		notes: PropTypes.array
	}

	render () {
		const {notes} = this.props;

		if (!notes || !notes.length) { return null; }

		return (
			<FillToBottom limit className={cx('note-list')}>
				<ul>
					{notes.map((note) => {
						return (
							<li key={note.getID()}>
								<NoteSummary note={note} />
							</li>
						);
					})}
				</ul>
			</FillToBottom>
		);
	}
}
