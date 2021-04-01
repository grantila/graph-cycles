import { ShortTree } from 'short-tree'
import { RotatedArraySet } from 'rotated-array-set'

import { uniq, uniqArrays } from './util'


export type Edge = [ from: string, to: Array< string > ];

export type Graph = Array< Edge >;

export interface AnalysisResult
{
	cycles: Array< Array< string > >;
	entrypoints: Array< Array< string > >;
	dependencies: Array< string >;
	all: Array< string >;
}

// Removes duplicate edges (they are ignored), and ensures single
function buildAndEnsureValidGraph( edges: Graph )
{
	const fromSet = new Set< string >( );
	edges.forEach( ( [ from ] ) =>
	{
		if ( fromSet.has( from ) )
			throw new Error( `Duplicate edge specification from "${from}"` );
		fromSet.add( from );
	} );

	return new Map( edges.map( ( [ from, to ] ) => [ from, uniq( to ) ] ) );
}

const stringCmp = ( a: string, b: string ) => a.localeCompare( b );

export function analyzeGraph( graph: Graph ): AnalysisResult
{
	const graphMap = buildAndEnsureValidGraph( graph );

	const entrypoints = new ShortTree( stringCmp );
	const cycleNodes = new Set< string >( );
	const cycles = new RotatedArraySet< string >( );
	const dependencies = new Set< string >( );

	const recordCycleEntrypoint = ( path: Array< string > ) =>
	{
		if ( path.length === 0 )
			return;
		entrypoints.insert( path );
	};

	const recordCycle = ( path: Array< string > ) =>
	{
		if ( cycles.add( path ) )
		{
			for ( const node of path )
				cycleNodes.add( node );
		}
	};

	const isPartOfCycle = ( node: string ): boolean => cycleNodes.has( node );

	// Traverse from each possible entrypoint
	for ( const [ from, _to ] of graphMap.entries( ) )
	{
		const path = [ from ];
		const visisted = new Set< string >( );
		let foundCycle = false;
		let createdCycle = false;
		const exitPaths: Array< Array< string > > = [ ];

		// Traversal
		let to = _to;
		let nodeNextIndex = 0;

		const getLeaf = ( ) => path[ path.length - 1 ];

		// Return true if we should turn around the traversal, if we've
		// entered a known cycle from a non-cycle entrypoint.
		const testNode = ( ): boolean =>
		{
			const node = getLeaf( );

			if ( !createdCycle && isPartOfCycle( node ) )
			{
				recordCycleEntrypoint( path.slice( 0, -1 ) );
				foundCycle = true;
				return true;
			}

			// Cycled back to itself
			if ( visisted.has( node ) )
			{
				// Record entrypoint to cycle
				const entrypointPath = path.slice(
					0,
					path.indexOf( node ) + 1
				);
				// Only record entrypoints if there's at least one node
				// *before* the cycle begins
				if ( entrypointPath.length > 1 )
					recordCycleEntrypoint( entrypointPath.slice( 0, -1 ) );

				const cycle = path.slice( path.indexOf( node ), -1 );

				recordCycle( cycle );

				createdCycle = true;
				return true;
			}

			return false;
		};

		// Returns true if walking down was successful
		const walkDown = ( ): boolean =>
		{
			if ( nodeNextIndex >= to.length )
				return false;

			const node = getLeaf( );
			visisted.add( node );

			const nextLeaf = to[ nodeNextIndex ];
			path.push( nextLeaf );
			to = graphMap.get( nextLeaf ) ?? [ ];
			nodeNextIndex = 0;
			return true;
		};

		// Returns true if walking up is not possible anymore (root is reached)
		const walkUp = ( ): boolean =>
		{
			if ( path.length === 1 )
				return true;

			const lastLeaf = getLeaf( );
			path.pop( );
			const node = getLeaf( );
			visisted.delete( node );
			to = graphMap.get( node ) ?? [ ];
			nodeNextIndex = to.indexOf( lastLeaf ) + 1;

			if ( nodeNextIndex >= to.length )
				return walkUp( );

			return false;
		};

		while ( true )
		{
			if ( testNode( ) )
			{
				if ( walkUp( ) )
					break;
			}

			if ( walkDown( ) )
				continue;

			if ( to.length === 0 )
			{
				// Save path up to this exitpoint.
				// If the path along the way here was part of a cycle, its
				// detection will mark this exitpoint as a dependence.
				exitPaths.push( [ ...path ] );
			}

			if ( walkUp( ) )
				break;
		}

		// If cycles were found, test exit nodes against cycles to find
		// dependencies
		if ( foundCycle || createdCycle )
			exitPaths.forEach( path =>
			{
				while (
					path.length > 0 &&
					!isPartOfCycle( path[ path.length - 1 ] )
				)
				{
					dependencies.add( path[ path.length - 1 ] );
					path.pop( );
				}
			} );
	}

	// There might be cycles found as part of an entrypoint *after* the
	// entrypoint was detected. Chop them off at the time of entering a cycle.
	const trimmedEntrypoints = uniqArrays(
		entrypoints.values( )
		.map( path =>
		{
			for ( let i = 0; i < path.length; ++i )
			{
				if ( isPartOfCycle( path[ i ] ) )
				{
					path = path.slice( 0, i );
					break;
				}
			}
			return path;
		} )
		.filter( path => path.length > 0 )
	);

	const all = new Set( [ ...cycleNodes, ...trimmedEntrypoints.flat( ) ] );

	return {
		cycles: cycles.values( ),
		entrypoints: trimmedEntrypoints,
		dependencies: [ ...dependencies ].filter( dep => !all.has( dep ) ),
		all: [ ...all ],
	};
}
