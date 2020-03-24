import React from 'react';
import {
	Pagination
} from 'react-bootstrap';

export default ( props ) => {
	const {
		      loading,
		      showPrevLink,
		      showNextLink,
		      handlePrevClick,
		      handleNextClick,
	      } = props;
	return (
		<>
			<Pagination className="nav-link-container d-flex">
				<Pagination.First 
					className={`
						mr-auto 
					    ${ showPrevLink ? 'show' : 'hide'}
						${ loading ? 'greyed-out' : '' }`}
					onClick={ handlePrevClick } />
				<Pagination.Last 
					className={`
						${ showNextLink ? 'show' : 'hide'}
						${ loading ? 'greyed-out' : '' }`}
					onClick={ handleNextClick }/>
			</Pagination>
		</>
	)
}
