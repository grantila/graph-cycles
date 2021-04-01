import { equalArray, equalRotatedArrays, uniq, uniqArrays } from './util'

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

export function analyzeGraph( graph: Graph )
: AnalysisResult
{
	const graphMap = buildAndEnsureValidGraph( graph );

	const entrypoints: Array< Array< string > > = [ ];
	const cycleNodes = new Set< string >( );
	const cycles: Array< Array< string > > = [ ];
	const dependencies = new Set< string >( );

	const recordCycleEntrypoint = ( path: Array< string > ) =>
	{
		path = [ ...path ];
		while ( path.length > 1 )
		{
			if (
				entrypoints.some( entrypoint =>
					equalArray( entrypoint, path )
				)
			)
				return;

			entrypoints.push( path );
			path = path.slice( 1 );
		}
	};

	const recordCycle = ( path: Array< string > ) =>
	{
		if ( !cycles.some( cycle => equalRotatedArrays( cycle, path ) ) )
		{
			cycles.push( [ ...path ] );
			for ( const node of path )
				cycleNodes.add( node );
		}
	};

	const isPartOfCycle = ( node: string ): boolean => cycleNodes.has( node );

	// Traverse from each possible entrypoint
	for ( const [ from, _to ] of graphMap.entries( ) )
	{
		console.log("analyzing", from)
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
				recordCycleEntrypoint( path );
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
					recordCycleEntrypoint( entrypointPath );

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
			console.log({
				entrypoints: entrypoints.length,
				cycleNodes: cycleNodes.size,
				cycles: cycles.length,
				dependencies: dependencies.size,
			});
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
		entrypoints
		.map( path =>
		{
			for ( let i = 0; i < path.length - 1; ++i )
			{
				if ( isPartOfCycle( path[ i ] ) )
				{
					path = path.slice( 0, i + 1 );
					break;
				}
			}
			return path;
		} )
		.filter( path => path.length > 1 )
	);

	const all = new Set( [ ...cycleNodes, ...trimmedEntrypoints.flat( ) ] );

	return {
		cycles,
		entrypoints: trimmedEntrypoints,
		dependencies: [ ...dependencies ].filter( dep => !all.has( dep ) ),
		all: [ ...all ],
	};
}
