import React from 'react';
import {scoped} from 'nti-lib-locale';
import {DateTime} from 'nti-web-commons';

const DEFAULT_TEXT = {
	published: 'Published',
	draft: 'Draft',
	edit: 'Edit'
};

const t = scoped('READING_LIST_ITEM', DEFAULT_TEXT);

export default class ReadingListItem extends React.Component {
	static propTypes = {
		reading: React.PropTypes.object,
		gotoResource: React.PropTypes.func
	}

	gotoResource = () => {
		const {reading, gotoResource} = this.props;

		if (gotoResource) {
			gotoResource(reading.NTIID);
		}
	}

	render () {
		const {reading} = this.props;

		return (
			<div className="course-resources-reading-list-item">
				{this.renderMeta(reading)}
				{this.renderPublish(reading)}
				{this.renderModified(reading)}
			</div>
		);
	}


	renderMeta = (reading) => {
		const {icon, title, isPublished} = reading;
		const canEdit = reading.hasLink('edit');
		const iconFallback = (iconUrl) => iconUrl || '/app/resources/images/file-icons/generic.png';

		return (
			<div className="meta">
				<div className="icon" style={{backgroundImage: `url(${iconFallback(icon)})`}} />
				<div className="wrap">
					<div className="title">{title}</div>
					<div className="published-inline">{t(isPublished ? 'published' : 'draft')}</div>
				</div>
				{canEdit && (<div className="edit" onClick={this.gotoResource}><span>{t('edit')}</span></div>)}
			</div>
		);
	}


	renderPublish = (reading) => {
		const {isPublished} = reading;

		return (
			<div className="published">
				{t(isPublished ? 'published' : 'draft')}
			</div>
		);
	}


	renderModified = (reading) => {
		const lastModified = reading.getLastModified();

		return (
			<div className="modified">
				<DateTime date={lastModified} />
			</div>
		);
	}
}
