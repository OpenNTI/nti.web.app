import React from 'react';
import PropTypes from 'prop-types';
import {Avatar} from 'nti-web-commons';

const info = 'Visible because your search contained someone\'s name.';
export default class UserList extends React.Component {
	static propTypes = {
		userList: PropTypes.array,
		currentTab: PropTypes.string
	}

	render () {
		const {currentTab, userList} = this.props;
		if(userList.length === 0){
			return null;
		}
		if(currentTab === 'all' || currentTab === 'people'){
			const userClass = currentTab === 'all' ? 'user-lookup-search all-user clearfix' : 'user-lookup-search people clearfix';
			return(
				<div className="container">
					<section className={userClass}>
						<div className="title-block-lookup">
							<p>People</p>
							<a className="view-all">View All</a>
						</div>
						<div className="result-block">
							<ul>
								{userList.map ((user, index) => {
									return (
										<li className="block-info" key={index}>
											<div className="user-info">
												<div className="img-user">
													<Avatar className="img-user" entityId={user.Username}/>
												</div>
												<h3 className="user-name">{user.realname}</h3>
												<span className="friend-stt">23 MUTUAL FRIENDS</span>
											</div>
											<a className="follow-btn">Follow</a>
										</li>
									);
								})}

							</ul>
						</div>
						<div className="bottom-info">
							<p>{info}</p>
							<a className="learn-more">Learn More</a>
						</div>
						<div className="bg-control left"/>
						<a className="left carousel-control" role="button" data-slide="prev">
							<i className="fa fa-arrow-left" aria-hidden="true"/>
							<span className="sr-only">Previous</span>
						</a>
						<div className="bg-control right"/>
						<a className="right carousel-control" role="button" data-slide="next">
							<i className="fa fa-arrow-right" aria-hidden="true"/>
							<span className="sr-only">Next</span>
						</a>
					</section>
				</div>
			);
		}

		return null;
	}
}
