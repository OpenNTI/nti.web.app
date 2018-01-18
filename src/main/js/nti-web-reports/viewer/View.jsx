import React from 'react';
import PropTypes from 'prop-types';
import {Prompt, Switch} from 'nti-web-commons';

import Context from './context';
import Report from './report';
import Header from './Header';
import Footer from './Footer';

export default class ReportViewer extends React.Component {
	static show (report) {
		return new Promise(fulfill => {
			Prompt.modal(
				(<ReportViewer
					report={report}
					onDismiss={fulfill}
				/>),
				'report-viewer-container'
			);
		});
	}

	static propTypes = {
		report: PropTypes.object.isRequired,
		onDismiss: PropTypes.func
	}


	constructor (props) {
		super(props);

		this.state = this.getStateFor(props);
	}


	componentWillReceiveProps (nextProps) {
		const {report:newReport} = nextProps;
		const {report:oldReport} = this.props;

		if (newReport !== oldReport) {
			this.setState(this.getStateFor(nextProps));
		}
	}


	getStateFor (props = this.props) {
		const {report} = props;
		const isContext = !report.href;

		return {
			report: isContext ? null : report,
			context: isContext ? report : null
		};
	}


	onDismiss = () => {
		const {onDismiss} = this.props;

		if (onDismiss) {
			onDismiss();
		}
	}


	selectReport = (report) => {
		this.setState({
			report
		});
	}


	render () {
		const {report, context} = this.state;
		const active = report ?
			'report' :
			context ?
				'context' :
				'empty';

		return (
			<div className="report-viewer">
				<Header report={report} context={context} onDismiss={this.onDismiss} />
				<Switch.Container className="report-body" active={active}>
					<Switch.Item name="report" component={Report} report={report} context={context} />
					<Switch.Item name="context" component={Context} report={report} context={context} selectReport={this.selectReport}/>
				</Switch.Container>
				<Footer onDismiss={this.onDismiss} />
			</div>
		);
	}
}

/*
const DEFAULT_TEXT = {
	download: 'Download',
	loading: 'Generating',
	done: 'Done'
};
const t = scoped('nti-web-reports.viewer.View', DEFAULT_TEXT);

class xReportViewer extends React.Component {
	static propTypes = {
		report: PropTypes.object.isRequired,
		onDismiss: PropTypes.func
	}

	static show (report) {
		return new Promise((fulfill) => {
			Prompt.modal(
				<ReportViewer
					report={report}
					onDismiss={fulfill}
				/>,
				'report-viewer-container'
			);
		});
	}


	state = {loading: true}


	getDownloadLink () {
		const {report} = this.props;

		return report.href;
	}


	getEmbedLink () {
		const {report} = this.props;

		return `${report.href}#view=FitH&toolbar=0&navpanes=0&statusbar=0&page=1`;
	}


	onLoad = () => {
		this.setState({
			loading: false
		});
	}


	onError = () => {}

	onDismiss = () => {
		const {onDismiss} = this.props;

		if (onDismiss) {
			onDismiss();
		}
	}


	render () {
		const {report} = this.props;
		const {loading} = this.state;
		const buttons = [
			{label: t('done'), onClick: this.onDismiss}
		];

		return (
			<div className="report-viewer">
				<div className="header">
					<div className="title">
						{report.title}
					</div>
					<a className="download" href={this.getDownloadLink()} download>
						<i className="icon-upload" />
						<span>{t('download')}</span>
					</a>
					<i className="icon-light-x" onClick={this.onDismiss}/>
				</div>
				<div className="content">
					{loading && (<Loading.Mask message={t('loading')} />)}
					<iframe
						src={this.getEmbedLink()}
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
				<DialogButtons buttons={buttons} />
			</div>
		);
	}

}*/
