import React from 'react';
import PropTypes from 'prop-types';

import Sidebar from '../../components/Sidebar';

import Timed from './sidebar-parts/Timed';
import Instructions from './sidebar-parts/Instructions';


AssignmentSidebar.propTypes = {
	assignmentModel: PropTypes.object,
	activeHistoryItemModel: PropTypes.object
};

export default function AssignmentSidebar (props) {
	const {assignmentModel, activeHistoryItemModel} = props;
	return !assignmentModel ? null : (
		<Sidebar>
			{!activeHistoryItemModel
				&& assignmentModel?.isAvailable?.()
				&& assignmentModel?.isTimed
				&& (
					<Timed {...props} />
				)}
			<Instructions {...props} />
		</Sidebar>
	);
}
