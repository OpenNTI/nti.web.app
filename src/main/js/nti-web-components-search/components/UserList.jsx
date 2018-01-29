import React from 'react';
import PropTypes from 'prop-types';
import {Avatar} from 'nti-web-commons';

const info = 'Visible because your search contained someone\'s name.';
export default class UserList extends React.Component {
	static propTypes = {
		userList: PropTypes.array,
		currentTab: PropTypes.string
	}

	constructor (props) {
		super(props);

		this.state = {
			showNext: false,
			showPre: false
		};
	}

	componentDidMount () {
		const {userList} = this.props;
		if (userList.length < 4) {
			this.setState({showNext: false, showPre: false});
		}
		else {
			this.setState({showNext: true, showPre: false});
		}
	}

	componentWillReceiveProps (prevProps) {
		if (prevProps.userList !== this.props.userList) {
			if (prevProps.userList.length < 4) {
				this.setState({showNext: false, showPre: false});
			}
			else {
				this.setState({showNext: true, showPre: false});
			}
		}
	}

	attachRef = el => this.el = el

	nextItems = () => {
		if (this.el.scrollLeft > this.el.scrollLeftMax - (215 * 3)) {
			this.setState({showNext: false});
			this.el.scrollLeft = this.el.scrollLeftMax;
			return;
		}

		if (!this.state.showPre) {
			this.setState({showPre: true});
		}
		const currentPos = parseInt((this.el.scrollLeft / 215), 10);
		this.el.scrollLeft = (currentPos * 215) + (215 * 3);
	}

	preItems = () => {
		if (this.el.scrollLeft < (215 * 3)) {
			this.setState({showPre: false});
			this.el.scrollLeft = 0;
			return;
		}

		if (!this.state.showNext) {
			this.setState({showNext: true});
		}
		const currentPos = parseInt((this.el.scrollLeft / 215), 10);
		this.el.scrollLeft = (currentPos * 215) - (215 * 3);
	}

	scrollItems = () => {
		if (this.el.scrollLeft === 0) {
			this.setState({showPre: false});
		}
		else if (this.el.scrollLeft === this.el.scrollLeftMax) {
			this.setState({showNext: false});
		}
		else {
			this.setState({showNext: true, showPre: true});
		}
	}

	render () {
		const {currentTab, userList} = this.props;
		const {showNext, showPre} = this.state;
		if (userList.length === 0) {
			return null;
		}
		if (currentTab === 'all' || currentTab === 'people') {
			const userClass = currentTab === 'all' ? 'user-lookup-search all-user clearfix' : 'user-lookup-search people clearfix';
			return (
				<div className="container">
					<section className={userClass}>
						<div className="title-block-lookup">
							<p>People</p>
							<a className="view-all">View All</a>
						</div>
						<div className="result-block">
							<ul ref={this.attachRef} onScroll={this.scrollItems}>
								{userList.map((user, index) => {
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
						{showPre && (
							<div>
								<div className="bg-control left"/>
								<a className="left carousel-control" role="button" data-slide="prev" onClick={this.preItems}>
									<i className="fa fa-arrow-left" aria-hidden="true"/>
									<span className="sr-only">Previous</span>
								</a>
							</div>
						)}

						{showNext && (
							<div>
								<div className="bg-control right"/>
								<a className="right carousel-control" role="button" data-slide="next" onClick={this.nextItems}>
									<i className="fa fa-arrow-right" aria-hidden="true"/>
									<span className="sr-only">Next</span>
								</a>
							</div>
						)}
					</section>
				</div>
			);
		}

		return null;
	}
}
