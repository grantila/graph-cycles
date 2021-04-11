import * as path from 'path'

import { analyzeGraph, analyzeGraphFast } from './index'
import { rotateArray, sortFastAnalysisResult, sortFullAnalysisResult } from './util'
import { FastAnalysisResult, FullAnalysisResult, Graph } from './types'


const fixtureDir = path.resolve( __dirname, '..', 'fixtures' );
const largeGraph = require( `${fixtureDir}/large-graph.json` );
const mediumGraph = require( `${fixtureDir}/medium-graph.json` );


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
		[ 'm', [ 'l' ] ],
		[ 'l', [ ] ],
		[ 'x', [ 'y' ] ],
		[ 'z', [ 'x', 'y' ] ],
	];

	makeRotationCombinations( initialGraph ).forEach( ( { graph, title } ) =>
		it( `should detect cycles properly: ${title}`, ( ) =>
		{
			const analysis = sortFullAnalysisResult( analyzeGraph( graph ) );

			const { cycles, entrypoints, dependencies, dependents, all } =
				analysis;

			const expected = sortFullAnalysisResult( {
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
				dependents: [ 'm' ],
				all: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ],
			} );

			expect( cycles ).toStrictEqual( expected.cycles );
			expect( entrypoints ).toStrictEqual( expected.entrypoints );
			expect( dependencies ).toStrictEqual( expected.dependencies );
			expect( dependents ).toStrictEqual( expected.dependents );
			expect( all ).toStrictEqual( expected.all );
		} )
	);

	makeRotationCombinations( initialGraph ).forEach( ( { graph, title } ) =>
		it( `should detect cycles properly (fast mode): ${title}`, ( ) =>
		{
			const analysis = sortFastAnalysisResult(
				analyzeGraphFast( graph )
			);

			const { cyclic, dependencies } = analysis;

			const expected = sortFastAnalysisResult( {
				cyclic: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ],
				dependencies: [ 'j', 'k', 'l' ],
				dependents: [ 'm' ],
			} );

			expect( cyclic ).toStrictEqual( expected.cyclic );
			expect( dependencies ).toStrictEqual( expected.dependencies );
		} )
	);

	it( "should fail on duplicate from-keys", ( ) =>
	{
		expect( ( ) => analyzeGraph( [ [ 'a', [ ] ], [ 'a', [ ] ] ] ) )
			.toThrowError( /duplicat/i );
	} );

	it( "should handle simple self-cycle (full mode)", ( ) =>
	{
		const analysis = sortFullAnalysisResult(
			analyzeGraph(
				[
					[ 'a', [ 'b' ] ],
					[ 'b', [ 'b', 'c' ] ],
					[ 'c', [ ] ],
					[ 'd', [ 'c' ] ]
				]
			)
		);
		const { cycles, entrypoints, dependencies, dependents, all } =
			analysis;

		expect( cycles ).toStrictEqual( [ [ 'b' ] ] );
		expect( entrypoints ).toStrictEqual( [ [ 'a' ] ] );
		expect( dependencies ).toStrictEqual( [ 'c' ] );
		expect( dependents ).toStrictEqual( [ 'd' ] );
		expect( all ).toStrictEqual( [ 'a', 'b' ] );
	} );

	it( "should handle simple self-cycle (fast mode)", ( ) =>
	{
		const analysis = sortFastAnalysisResult(
			analyzeGraphFast(
				[
					[ 'a', [ 'b' ] ],
					[ 'b', [ 'b', 'c' ] ],
					[ 'c', [ ] ],
				]
			)
		);
		const { cyclic, dependencies, dependents } = analysis;

		expect( cyclic ).toStrictEqual( [ 'a', 'b' ] );
		expect( dependencies ).toStrictEqual( [ 'c' ] );
		expect( dependents ).toStrictEqual( [ ] );
	} );

	it( "should handle simple diamond (fast mode)", ( ) =>
	{
		const analysis = sortFastAnalysisResult(
			analyzeGraphFast(
				[
					[ 'a', [ 'b', 'c' ] ],
					[ 'b', [ 'd' ] ],
					[ 'c', [ 'd'] ],
				]
			)
		);
		const { cyclic, dependencies, dependents } = analysis;

		expect( cyclic ).toStrictEqual( [  ] );
		expect( dependencies ).toStrictEqual( [ ] );
		expect( dependents ).toStrictEqual( [ ] );
	} );
} );

describe( "medium graph (full mode)", ( ) =>
{
	let analysis: FullAnalysisResult;

	it( "should handle medium graph", ( ) =>
	{
		analysis = sortFullAnalysisResult( analyzeGraph( mediumGraph ) );
		expect( analysis ).toMatchSnapshot( );
	} );

	makeRotationCombinations( mediumGraph ).forEach( ( { graph, title } ) =>
		it( `should handle medium graph: ${title}`, ( ) =>
		{
			const largeAnalysis = sortFullAnalysisResult(
				analyzeGraph( graph )
			);
			expect( largeAnalysis ).toStrictEqual( analysis );
		} )
	);
} );

describe( "medium graph (fast mode)", ( ) =>
{
	let analysis: FastAnalysisResult;

	it( "should handle medium graph (base case)", ( ) =>
	{
		analysis = sortFastAnalysisResult( analyzeGraphFast( mediumGraph ) );
		expect( analysis ).toMatchSnapshot( );
	} );

	makeRotationCombinations( mediumGraph ).forEach( ( { graph, title } ) =>
		it( `should handle medium graph: ${title}`, ( ) =>
		{
			const largeAnalysis = sortFastAnalysisResult(
				analyzeGraphFast( graph )
			);
			expect( largeAnalysis ).toStrictEqual( analysis );
		} )
	);
} );

describe( "large graph (fast mode)", ( ) =>
{
	let analysis: FastAnalysisResult;

	it( "should handle large graph", ( ) =>
	{
		analysis = sortFastAnalysisResult( analyzeGraphFast( largeGraph ) );
		expect( analysis ).toMatchSnapshot( );
	} );

	makeRotationCombinations( largeGraph ).forEach( ( { graph, title } ) =>
		it( `should handle large graph: ${title}`, ( ) =>
		{
			const largeAnalysis = sortFastAnalysisResult(
				analyzeGraphFast( graph )
			);
			expect( largeAnalysis ).toStrictEqual( analysis );
		} )
	);
} );
