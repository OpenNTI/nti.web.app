import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';
import {Presentation} from '@nti/web-commons';

const t = scoped('nti-web-site-admin.components.content.list.table.columns.BookName', {
	headerTitle: 'Type',
	title: 'Name'
});

export default class BookName extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	static cssClassName = 'bookname-col';

	static Name = () => t('title')

	static SortKey = 'title'

	render () {
		const {item} = this.props;
		return (
			<LinkTo.Path to={`./book/${item.getID()}`} activeClassName="active" exact>
				<div className="cell">
					<Presentation.Asset contentPackage={item} type="landing">
						<img className="book-icon"/>
					</Presentation.Asset>
					<div className="book-info">
						<div className="title">{item.title}</div>
					</div>
				</div>
			</LinkTo.Path>
		);
	}
}
