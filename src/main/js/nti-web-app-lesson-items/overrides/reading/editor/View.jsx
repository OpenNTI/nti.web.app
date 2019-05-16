import React from 'react';
import PropTypes from 'prop-types';
import {Loading} from '@nti/web-commons';
import {Editor} from '@nti/web-content';

import Store from './Store';


export default
@Store.connect(['error', 'loading', 'page'])
class NTIWebAppLessonItemsReadingEditor extends React.Component {
	static deriveBindingFromProps (props) {
		const {location = {}} = props;

		return {
			page: location.item,
			parents: location.items,
			course: props.course
		};
	}

	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object,
			items: PropTypes.array
		}),
		course: PropTypes.object.isRequired,

		loading: PropTypes.bool,
		error: PropTypes.any,
		page: PropTypes.object
	}

	render () {
		const {loading, error, page} = this.props;

		return (
			<div>
				{loading && (<Loading.Spinner.Large />)}
				{!loading && error && this.renderError(error)}
				{!loading && !error && this.renderPage(page)}
			</div>
		);
	}


	renderError () {
		//TODO: figure this out
		return null;
	}


	renderPage (page) {
		if (!page) { return null; }

		const {course} = this.props;

		return (
			<Editor.Modal course={course} contentPackage={page} />
		);
	}
}
