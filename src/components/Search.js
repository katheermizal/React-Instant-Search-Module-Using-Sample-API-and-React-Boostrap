import React from 'react';
import axios from 'axios';
import PageNavigation from './PageNavigation';

import {
	Container,
	Row,
	Col,
	Navbar,
	Form,
	FormControl,
	Button,
	Alert,
	Spinner,
	Table,
	Image
} from 'react-bootstrap';

class Search extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			query: '',
			results: {},
			loading: false,
			message: '',
			totalResults: 0,
			totalPages: 0,
			currentPageNo: 0,
		};
		this.cancel = '';
	}


	/**
	 * Get the Total Pages count.
	 *
	 * @param total
	 * @param denominator Count of results per page
	 * @return {number}
	 */
	getPageCount = ( total, denominator ) => {
		const divisible	= 0 === total % denominator;
		const valueToBeAdded = divisible ? 0 : 1;
		return Math.floor( total/denominator ) + valueToBeAdded;
	};

	/**
	 * Fetch the search results and update the state with the result.
	 * Also cancels the previous query before making the new one.
	 *
	 * @param {int} updatedPageNo Updated Page No.
	 * @param {String} query Search Query.
	 *
	 */
	fetchSearchResults = ( updatedPageNo = '', query ) => {
		const pageNumber = updatedPageNo ? `&page=${updatedPageNo}` : '';
		const searchUrl = `https://pixabay.com/api/?key=15679288-a824d58e99278828b823404dd&q=${query}${pageNumber}`;

		if( this.cancel ) {
			this.cancel.cancel();
		}

		this.cancel = axios.CancelToken.source();

		axios.get( searchUrl, {
			cancelToken: this.cancel.token
		} )
			.then( res => {
				const total = res.data.total;
				const totalPagesCount = this.getPageCount( total, 20 );
				const resultNotFoundMsg = ! res.data.hits.length
										? 'There are no more search results. Please try a new search'
										: '';
				this.setState( {
					results: res.data.hits,
					message: resultNotFoundMsg,
					totalResults: total,
					totalPages: totalPagesCount,
					currentPageNo: updatedPageNo,
					loading: false
				} )
			} )
			.catch( error => {
				if ( axios.isCancel(error) || error ) {
					this.setState({
						loading: false,
						message: 'Failed to fetch the data. Please check network'
					})
				}
			} )
	};

	handleOnInputChange = ( event ) => {
		const query = event.target.value;
		if ( ! query ) {
			this.setState( { query, results: {}, message: '', totalPages: 0, totalResults: 0 } );
		} else {
			this.setState( { query, loading: true, message: '' }, () => {
				this.fetchSearchResults( 1, query );
			} );
		}
	};

	/**
	 * Fetch results according to the prev or next page requests.
	 *
	 * @param {String} type 'prev' or 'next'
	 */
	handlePageClick = ( type, event) => {
		event.preventDefault();
		const updatePageNo = 'prev' === type
			? this.state.currentPageNo - 1
			: this.state.currentPageNo + 1;

		if( ! this.state.loading  ) {
			this.setState( { loading: true, message: '' }, () => {
				this.fetchSearchResults( updatePageNo, this.state.query );
			} );
		}
	};

	renderSearchResults = () => {
		const { results } = this.state;

		if ( Object.keys( results ).length && results.length ) {
			return (
				<>
					<Table responsive striped bordered hover variant="dark">
						<caption>Images From Pixbay</caption>
						<thead>
							<tr>
								<th>IMAGE DETAILS</th>
								<th>TAGS</th>
								<th>CUSTOMER FOCUS</th>
								<th>USER DETAILS</th>
								<th>ACTION</th>
							</tr>
						</thead>
						<tbody>
							{ results.map(( result, key ) => {
								return (
									<tr key={ key }>
										<td>
											<Image 
												width={130}
												alt={ result.username }
												src={ result.previewURL }
												className="mb-2"
												rounded 
											/>
											<p className="mb-1">Type: { result.type } </p>
											<p className="mb-1">ID: { result.id } </p>
										</td>
										<td>{ result.tags }</td>
										<td>
											<p className="mb-1">Views: { result.views } </p>
											<p className="mb-1">Downloads: { result.downloads } </p>
											<p className="mb-1">Likes: { result.likes } </p>
											<p className="mb-1">Comments: { result.comments } </p>
										</td>
										<td >
											<Image 
												width={100}
												src={ result.userImageURL } 
												alt={ result.user } 
												className="mb-2"
												rounded 
											/>
											<p className="mb-1">{ result.user }</p>
											<p className="mb-1">{ result.user_id }</p>
										</td>
										<td> 
											<Button 
												href={ result.pageURL } 
												target="_blank"  
												variant="outline-info" >
												View More
											</Button> 
										</td>
									</tr>
								)
							} ) }
						</tbody>
					</Table>
				</>
			)
		}
	};

	render() {
		const { query, loading, message, currentPageNo, totalPages } = this.state;

		const showPrevLink = 1 < currentPageNo;
		const showNextLink = totalPages > currentPageNo;

		return (
			<>
				{/* Header Navigation */}
				<Navbar  bg="dark" variant="dark" expand="lg">
					<Navbar.Brand href="#home">Instant Search</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Form inline className="ml-auto">
							<FormControl 
								type="text"
								name="query"
								value={ query }
								id="search-input"
								placeholder="Search..."
								onChange={this.handleOnInputChange}
								/>
						</Form>
					</Navbar.Collapse>
				</Navbar>
				
				<Container>
					{/*	Error Message*/}
					<Row>
						<Col xs={12}>
							{ 
								message && 
								<Alert variant="danger" className="d-flex"> { message } </Alert>
							}
						</Col>
					</Row>

					{/* Pagination */}	
					<Row>
						<Col xs={12}>
							<PageNavigation
								loading={loading}
								showPrevLink={showPrevLink}
								showNextLink={showNextLink}
								handlePrevClick={ (event) => this.handlePageClick('prev', event )}
								handleNextClick={ (event) => this.handlePageClick('next', event )}
							/>
						</Col>		
					</Row>	
						
					{/*	Results */}	
					<Row>
						<Col xs={12}>
							{ this.renderSearchResults() }
						</Col>
					</Row>

					{/*	Loader */}
					<Spinner animation="border" className={`search-loading ${ loading ? 'show' : 'hide' }`} />	
				</Container>
			</>
		)
	}
}

export default Search
