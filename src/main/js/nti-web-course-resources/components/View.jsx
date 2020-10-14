import './View.scss';
import React from 'react';
import {scoped} from '@nti/lib-locale';
import PropTypes from 'prop-types';
import {searchable, contextual} from '@nti/web-search';
import {Flyout, Icons, Button} from '@nti/web-commons';

import Controls from './Controls';
import Readings, {KEY as READINGS} from './readings';
import Surveys from './surveys';

const DEFAULT_STRINGS = {
	'readings': 'Readings',
	'surveys': 'Surveys'
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

	flyout = React.createRef()

	state = {
		active: 'readings'
	}

	onCreate = () => {
		const {createResource} = this.props;

		if (createResource) {
			createResource(this.state.active);
		}
	}


	gotoResource = (id) => {
		const {gotoResource} = this.props;

		if (gotoResource) {
			gotoResource(id);
		}
	}

	closeFlyout = () => this.flyout.current?.dismiss()

	selectReadings = () => this.setState({active: 'readings'}, this.closeFlyout)
	selectSurveys = () => this.setState({active: 'surveys'}, this.closeFlyout)


	render () {
		const {course, searchTerm} = this.props;
		const {active} = this.state;

		const headerTrigger = (
			<div className="header">
				<span>{t(active)}</span>
				<Icons.Chevron.Down />
			</div>
		);

		return (
			<div className="course-resources">
				<div className="course-resources-header">
					<Flyout.Triggered ref={this.flyout} trigger={headerTrigger} horizontalAlign={Flyout.ALIGNMENTS.LEFT_OR_RIGHT} >
						<div className="course-resource-types">
							<Button plain className="header-option" onClick={this.selectReadings}>
								{t('readings')}
							</Button>
							<Button plain className="header-option" onClick={this.selectSurveys}>
								{t('surveys')}
							</Button>
						</div>
					</Flyout.Triggered>
					<div className="spacer" />
					<Controls onCreate={this.onCreate} />
				</div>
				{active === 'readings' && (
					<Readings course={course} gotoResource={this.gotoResource} searchTerm={searchTerm} />
				)}
				{active === 'surveys' && (
					<Surveys course={course} gotoResource={this.gotoResource} searchTerm={searchTerm} />
				)}
			</div>
		);
	}
}
