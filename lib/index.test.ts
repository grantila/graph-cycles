import { analyzeGraph} from './index'
import { rotateArray, sortAnalysisResult } from './util'
import { Graph } from './types'


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
			const analysis = sortAnalysisResult( analyzeGraph( graph ) );

			const { cycles, entrypoints, dependencies, all } =  analysis;

			const expected = sortAnalysisResult( {
				cycles: [
					[ 'g' ],
					[ 'c', 'd', 'h', 'i' ],
					[ 'c', 'd', 'e', 'g', 'h', 'i' ],
					[ 'd', 'e', 'f' ],
				],
				entrypoints: [
					[ 'a' ],
					[ 'b' ],
				],
				dependencies: [ 'j', 'k', 'l' ],
				all: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ],
			} );

			expect( cycles ).toStrictEqual( expected.cycles );
			expect( entrypoints ).toStrictEqual( expected.entrypoints );
			expect( dependencies ).toStrictEqual( expected.dependencies );
			expect( all ).toStrictEqual( expected.all );
		} )
	);

	it( "should fail on duplicate from-keys", ( ) =>
	{
		expect( ( ) => analyzeGraph( [ [ 'a', [ ] ], [ 'a', [ ] ] ] ) )
			.toThrowError( /duplicat/i );
	} );
} );
