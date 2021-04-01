export function uniq( arr: Array< string > ): Array< string >
{
	return [ ...new Set( arr ) ];
}

export function uniqArrays( arrays: Array< Array< string > > ): typeof arrays
{
	const known: Array< Array< string > > = [ ];

	return arrays
		.filter( array =>
		{
			const isKnown = known.some( arr => equalArray( arr, array ) );
			if ( isKnown )
				return false;
			known.push( array );
			return true;
		} );
}

export function equalArray( a: Array< string >, b: Array< string > ): boolean
{
	if ( a.length !== b.length )
		return false;
	else if ( a.length === 0 )
		return true;
	return !a.some( ( nodeA, i ) => nodeA !== b[ i ] );
}

export function equalRotatedArrays( a: Array< string >, b: Array< string > )
: boolean
{
	if ( a.length !== b.length )
		return false;
	else if ( !a.length )
		return true;

	const offset = b.indexOf( a[ 0 ] );
	if ( offset === -1 )
		return false;

	const _b =
		offset === 0
		? b
		: [ ...b.slice( offset ), ...b.slice( 0, offset ) ];
	return equalArray( a, _b );
}
