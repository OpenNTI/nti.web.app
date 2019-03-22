import React from 'react';
import PropTypes from 'prop-types';

import Sidebar from '../../components/Sidebar';

import Timed from './sidebar-parts/Timed';


export default class AssignmentSidebar extends React.Component {
	static propTypes = {
		assignmentModel: PropTypes.object,
		activeHistoryItemModel: PropTypes.object
	}

	render () {
		const {assignmentModel, activeHistoryItemModel} = this.props;

		if (!assignmentModel) { return null; }

		const timed = assignmentModel.isTimed;
		const available = assignmentModel.isAvailable();

		return (
			<Sidebar>
				{activeHistoryItemModel && this.renderHistoryItem()}
				{!activeHistoryItemModel && !available && this.renderUnavailable()}
				{!activeHistoryItemModel && available && timed && this.renderTimer()}
				{!activeHistoryItemModel && available && !timed && this.renderNotTimed()}
			</Sidebar>
		);
	}


	renderHistoryItem () {
	}

	renderTimer () {
		return (<Timed {...this.props} />);
	}

	renderNotTimed () {
	}
}
