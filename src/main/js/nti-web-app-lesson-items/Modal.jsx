import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Prompt} from '@nti/web-commons';
import {Content} from '@nti/web-course';
import {decodeFromURI} from '@nti/lib-ntiids';

import Styles from './Modal.css';

const cx = classnames.bind(Styles);

function pathToSelection (path) {
	if (!path) { return null; }

	try {
		const parts = path.split('/');
		let started = false;
		let selection = [];

		for (let part of parts) {
			if (part === 'items') {
				started = true;
			} else if (part) {
				if (!started) { return null; }

				selection.push(decodeFromURI(part));
			}
		}

		if (selection.length === 0) { return null;}

		return selection;
	} catch (e) {
		return null;
	}
}

export default class NTIWebAppLessonItems extends React.Component {
	static propTypes = {
		course: PropTypes.object,
		lesson: PropTypes.string,
		dismissPath: PropTypes.string,
		path: PropTypes.string
	}

	state = {}

	componentDidMount () {
		this.setup();
	}

	componentDidUpdate (prevProps) {
		const {path} = this.props;
		const {path:prevPath} = prevProps;

		if (path !== prevPath) {
			this.setup();
		}
	}


	setup () {
		const {path} = this.props;

		this.setState({
			selection: pathToSelection(path)
		});
	}


	render () {
		const {course, lesson, dismissPath} = this.props;
		const {selection} = this.state;

		if (!selection || !course || !lesson) {
			return null;
		}

		return (
			<Prompt.Dialog className={cx('nti-web-app-lesson-items-modal')}>
				<Content.Pager course={course} lesson={lesson} selection={selection} dismissPath={dismissPath} />
			</Prompt.Dialog>
		);
	}
}
