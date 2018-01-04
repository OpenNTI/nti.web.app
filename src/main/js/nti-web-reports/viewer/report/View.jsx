import React from 'react';
import PropTypes from 'prop-types';
import {Loading} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	loading: 'Generating'
};
const t = scoped('nti-web-reports.viewer.report.View', DEFAULT_TEXT);


function getEmbedLink (report) {
	return `${report.href}#view=FitH&toolbar=0&navpanes=0&statusbar=0&page=1`;
}

export default class ReportView extends React.Component {
	static propTypes = {
		report: PropTypes.object.isRequired
	}

	constructor (props) {
		super(props);

		this.state = {
			loading: true,
			error: false,
			embedLink: getEmbedLink(props.report)
		};
	}

	componentWillReceiveProps (nextProps) {
		const {report:nextReport} = nextProps;
		const {report:oldReport} = this.props;

		if (nextReport !== oldReport) {
			this.setState({
				loading: true,
				error: false,
				embedLink: getEmbedLink(nextReport)
			});
		}
	}


	onLoad = () => {
		this.setState({
			loading: false
		});
	}

	onError = () => {
		this.setState({
			error: true
		});
	}


	render () {
		const {loading, embedLink} = this.state;

		return (
			<div className="report-content">
				{loading && <Loading.Mask message={t('loading')} />}
				<iframe
					src={embedLink}
					onLoad={this.onLoad}
					onError={this.onError}
					frameBorder="0"
					marginWidth="0"
					marginHeight="0"
					seamless="true"
					transparent="true"
					allowTransparency="true"
				/>
			</div>
		);
	}
}
