import { analyzeGraph, Graph } from './index'


const sortArrays = ( arr: Array< Array< string > > ): typeof arr =>
	[ ...arr ].sort( ( a, b ) =>
	{
		if ( a.length < b.length )
			return -1;
		else if ( a.length > b.length )
			return 1;
		else
			return JSON.stringify( a ).localeCompare( JSON.stringify( b ) );
	} );

function rotateArray< T >( arr: Array< T >, offset: number ): Array< T >
{
	return [ ...arr.slice( offset ), ...arr.slice( 0, offset ) ];
}

function rotationSort( arr: Array< string > ): Array< string >
{
	const anchor = [ ...arr ].sort( )[ 0 ];
	while ( arr[ 0 ] !== anchor )
		arr = rotateArray( arr, 1 );
	return arr;
}

function rotationSortArrays( arrays: Array< Array< string > > ): typeof arrays
{
	return arrays.map( arr => rotationSort( arr ) );
}

function makeRotationCombinations( graph: Graph )
: Array< { graph: Graph, title: string } >
{
	return graph
		.flatMap( ( _, i ) =>
		{
			const newGraph = rotateArray( graph, i );

			const title = `Outer rotate ${i} (start with ${newGraph[0][0]})`;

			return [
				{
					graph: newGraph,
					title,
				},
				{
					graph: newGraph.map( ( [ from, to ] ) =>
						[ from, [ ...to ].reverse( ) ]
					),
					title: `${title}, inner rotation`,
				},
			];
		} );
}

describe( "graph-cycles", ( ) =>
{
	const initialGraph: Graph = [
		[ 'a', [ 'b', 'c' ] ],
		[ 'b', [ 'c', 'j' ] ],
		[ 'c', [ 'd' ] ],
		[ 'd', [ 'e', 'h' ] ],
		[ 'e', [ 'f', 'g' ] ],
		[ 'f', [ 'd', 'k' ] ],
		[ 'g', [ 'g', 'h' ] ],
		[ 'h', [ 'i' ] ],
		[ 'i', [ 'c' ] ],
		[ 'j', [ ] ],
		[ 'k', [ 'l' ] ],
		[ 'l', [ ] ],
		[ 'x', [ 'y' ] ],
		[ 'z', [ 'x', 'y' ] ],
	];

	makeRotationCombinations( initialGraph ).forEach( ( { graph, title } ) =>
		it( `should detect cycles properly: ${title}`, ( ) =>
		{
			const analysis = analyzeGraph( graph );

			const { cycles, entrypoints, dependencies, all } = analysis;

			expect( rotationSortArrays( sortArrays( cycles ) ) )
				.toStrictEqual(
					rotationSortArrays( sortArrays( [
						[ 'g' ],
						[ 'c', 'd', 'h', 'i' ],
						[ 'c', 'd', 'e', 'g', 'h', 'i' ],
						[ 'd', 'e', 'f' ],
					] ) )
				);

			expect( sortArrays( entrypoints ) ).toStrictEqual( sortArrays( [
				[ 'b', 'c' ],
				[ 'a', 'b', 'c' ],
				[ 'a', 'c' ],
			] ) );

			expect( [ ...dependencies ].sort( ) ).toStrictEqual(
				[ 'j', 'k', 'l' ].sort( )
			);

			expect( [ ...all ].sort( ) ).toStrictEqual(
				[ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ].sort( )
			);
		} )
	);

	it( "should fail on duplicate from-keys", ( ) =>
	{
		expect( ( ) => analyzeGraph( [ [ 'a', [ ] ], [ 'a', [ ] ] ] ) )
			.toThrowError( /duplicat/i );
	} );
} );
