import React from 'react';
import {scoped} from '@nti/lib-locale';
import PropTypes from 'prop-types';
import {searchable, contextual} from '@nti/web-search';

import Controls from './Controls';
import Readings, {KEY as READINGS} from './readings';

const DEFAULT_STRINGS = {
	'readings': 'Readings'
};

const t = scoped('nti-course-resources.View', DEFAULT_STRINGS);

export default
@searchable()
@contextual(t('readings'))
class CourseResources extends React.Component {
	static READINGS = READINGS

	static propTypes = {
		course: PropTypes.object,
		createResource: PropTypes.func,
		gotoResource: PropTypes.func,
		searchTerm: PropTypes.string
	}

	static defaultProps = {
		activeType: READINGS
	}


	onCreate = () => {
		const {createResource} = this.props;

		if (createResource) {
			createResource();
		}
	}


	gotoResource = (id) => {
		const {gotoResource} = this.props;

		if (gotoResource) {
			gotoResource(id);
		}
	}


	render () {
		const {course, searchTerm} = this.props;

		return (
			<div className="course-resources">
				<div className="course-resources-header">
					<span className="header">{t('readings')}</span>
					<Controls onCreate={this.onCreate} />
				</div>
				<Readings course={course} gotoResource={this.gotoResource} searchTerm={searchTerm} />
			</div>
		);
	}
}
