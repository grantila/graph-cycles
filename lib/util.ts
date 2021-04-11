import { compare } from 'fast-string-compare'

import { FullAnalysisResult, FastAnalysisResult } from './types'


export function uniq( arr: ReadonlyArray< string > ): Array< string >
{
	return [ ...new Set( arr ) ];
}

export function uniqArrays( arrays: Array< Array< string > > ): typeof arrays
{
	const known: Array< Array< string > > = [ ];

	return arrays
		.filter( array =>
		{
			const isKnown = known.some( arr => !arrayCompare( arr, array ) );
			if ( isKnown )
				return false;
			known.push( array );
			return true;
		} );
}

export function arrayCompare( a: Array< string >, b: Array< string > ): number
{
	if ( a.length !== b.length )
		return a.length > b.length ? 1 : -1;
	else if ( a.length === 0 )
		return 0;
	for ( let i = 0; i < a.length; ++i )
	{
		const diff = compare( a[ i ], b[ i ] );
		if ( diff !== 0 )
			return diff;
	}
	return 0;
}


function sortArrays( arr: Array< Array< string > > ): typeof arr
{
	return [ ...arr ].sort( ( a, b ) =>
	{
		if ( a.length < b.length )
			return -1;
		else if ( a.length > b.length )
			return 1;
		else
			return compare( JSON.stringify( a ), JSON.stringify( b ) );
	} );
}

export function rotateArray< T >( arr: ReadonlyArray< T >, offset: number )
: Array< T >
{
	return [ ...arr.slice( offset ), ...arr.slice( 0, offset ) ];
}

function rotationSort( arr: ReadonlyArray< string > ): Array< string >
{
	const anchor = [ ...arr ].sort( compare )[ 0 ];
	while ( arr[ 0 ] !== anchor )
		arr = rotateArray( arr, 1 );
	return [ ...arr ];
}

function rotationSortArrays( arrays: Array< Array< string > > ): typeof arrays
{
	return arrays.map( arr => rotationSort( arr ) );
}

export function sortFullAnalysisResult( result: FullAnalysisResult )
: FullAnalysisResult
{
	return {
		cycles: sortArrays( rotationSortArrays( result.cycles ) ),
		entrypoints: sortArrays( result.entrypoints ),
		dependencies: [ ...result.dependencies ].sort( compare ),
		dependents: [ ...result.dependents ].sort( compare ),
		all: [ ...result.all ].sort( compare ),
	};
}

export function sortFastAnalysisResult( result: FastAnalysisResult )
: FastAnalysisResult
{
	return {
		cyclic: [ ...result.cyclic ].sort( compare ),
		dependencies: [ ...result.dependencies ].sort( compare ),
		dependents: [ ...result.dependents ].sort( compare ),
	};
}
