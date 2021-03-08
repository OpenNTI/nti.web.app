import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Prompt } from '@nti/web-commons';
import { Content } from '@nti/web-course';
import { decodeFromURI } from '@nti/lib-ntiids';
import { LinkTo } from '@nti/web-routing';

import Styles from './Modal.css';
import overrides from './overrides';

const cx = classnames.bind(Styles);

function pathToSelection(route) {
	if (!route) {
		return null;
	}

	const [path] = route.split('#');

	try {
		const parts = path.split('/');
		let started = false;
		let selection = [];

		for (let part of parts) {
			if (part === 'items') {
				started = true;
			} else if (part === 'object') {
				break;
			} else if (part) {
				if (!started) {
					return null;
				}

				selection.push(decodeFromURI(part));
			}
		}

		if (selection.length === 0) {
			return null;
		}

		return selection;
	} catch (e) {
		return null;
	}
}

export default class NTIWebAppLessonItems extends React.Component {
	static pathToSelection(path) {
		return pathToSelection(path);
	}

	static propTypes = {
		course: PropTypes.object,
		lesson: PropTypes.string,
		dismissPath: PropTypes.string,
		path: PropTypes.string,
		requiredOnly: PropTypes.bool,
		handleNavigation: PropTypes.func,
		firstSelection: PropTypes.bool,
		activeObjectId: PropTypes.string,
		activeHash: PropTypes.string,
	};

	static contextTypes = {
		router: PropTypes.object,
	};

	state = {};

	componentDidMount() {
		this.setup();
	}

	componentDidUpdate(prevProps) {
		const { path } = this.props;
		const { path: prevPath } = prevProps;

		if (path !== prevPath) {
			this.setup();
		}
	}

	setup() {
		const { path } = this.props;

		this.setState({
			selection: pathToSelection(path),
		});
	}

	onBeforeDismiss = () => {
		const { dismissPath } = this.props;
		const { router } = this.context;

		if (dismissPath && router) {
			LinkTo.Path.routeTo(router, dismissPath);
		}
	};

	render() {
		const {
			course,
			lesson,
			dismissPath,
			requiredOnly,
			handleNavigation,
			firstSelection,
			activeObjectId,
			activeHash,
		} = this.props;
		const { selection } = this.state;

		if (!selection || !course || !lesson) {
			return null;
		}

		return (
			<Prompt.Dialog
				className={cx('nti-web-app-lesson-items-modal')}
				closeOnMaskClick={false}
				closeOnEscape={true}
				onBeforeDismiss={this.onBeforeDismiss}
			>
				<Content.Pager
					course={course}
					lesson={lesson}
					selection={selection}
					requiredOnly={requiredOnly}
					handleNavigation={handleNavigation}
					firstSelection={firstSelection}
					activeObjectId={
						activeObjectId ? decodeFromURI(activeObjectId) : null
					}
					activeHash={activeHash}
					dismissPath={dismissPath}
					overrides={overrides}
				/>
			</Prompt.Dialog>
		);
	}
}
