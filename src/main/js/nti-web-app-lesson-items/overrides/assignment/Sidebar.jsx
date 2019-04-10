import React from 'react';
import PropTypes from 'prop-types';

import Sidebar from '../../components/Sidebar';

import Timed from './sidebar-parts/Timed';
import Instructions from './sidebar-parts/Instructions';


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
				{!activeHistoryItemModel && available && timed && (<Timed {...this.props} />)}
				<Instructions {...this.props} />
			</Sidebar>
		);
	}
}
