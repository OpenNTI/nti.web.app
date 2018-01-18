import React from 'react';
import PropTypes from 'prop-types';

import {getContextViewer} from '../../contexts';


export default class ReportContext extends React.Component {
	static propTypes = {
		context: PropTypes.object.isRequired,
		selectReport: PropTypes.func
	}


	onSelect = (item) => {
		const {context, selectReport} = this.props;
		const {rel} = context;
		const reports = (item && item.Reports) || [];

		for (let report of reports) {
			if (report.rel === rel) {
				selectReport(report);
			}
		}
	}


	render () {
		const {context} = this.props;
		const Viewer = getContextViewer(context.contextID);

		return (
			<div className="report-viewer-context">
				{
					Viewer ?
						(<Viewer context={context.context} onSelect={this.onSelect} />) :
						(
							<div>
								No Context Viewer
							</div>
						)
				}
			</div>
		);
	}
}
