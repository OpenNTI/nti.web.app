import React from 'react';
import PropTypes from 'prop-types';


import {getContextViewer} from '../../contexts';


ReportContext.propTypes = {
	context: PropTypes.object
};
export default function ReportContext ({context}) {
	const Viewer = getContextViewer(context.contextID);

	return Viewer ?
		(<Viewer context={context} />) :
		(
			<div>
				No Context Viewer
			</div>
		);
}
