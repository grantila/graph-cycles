import { arrayCompare, uniq, uniqArrays } from './util'


describe( "utils", ( ) =>
{
	describe( "arrayCompare", ( ) =>
	{
		it( "should handle empty", ( ) =>
		{
			expect( arrayCompare( [ ], [ ] ) ).toBe( 0 );
		} );

		it( "should handle different sizes", ( ) =>
		{
			expect( arrayCompare( [ 'a', 'b' ], [ 'a' ] ) ).toBe( 1 );
		} );

		it( "should handle different sizes opposite", ( ) =>
		{
			expect( arrayCompare( [ 'a' ], [ 'a', 'b' ] ) ).toBe( -1 );
		} );

		it( "should handle equal", ( ) =>
		{
			expect( arrayCompare( [ 'a', 'b' ], [ 'a', 'b' ] ) ).toBe( 0 );
		} );
	} );

	describe( "uniq", ( ) =>
	{
		it( "should handle empty", ( ) =>
		{
			expect( uniq( [ ] ) ).toStrictEqual( [ ] );
		} );

		it( "should handle already uniq", ( ) =>
		{
			expect( uniq( [ 'a', 'b' ] ) ).toStrictEqual( [ 'a', 'b' ] );
		} );

		it( "should handle already duplicates", ( ) =>
		{
			expect( uniq( [ 'a', 'b', 'a' ] ) ).toStrictEqual( [ 'a', 'b' ] );
		} );
	} );

	describe( "uniqArrays", ( ) =>
	{
		it( "should handle empty", ( ) =>
		{
			expect( uniqArrays( [ ] ) ).toStrictEqual( [ ] );
		} );

		it( "should handle already uniq", ( ) =>
		{
			expect( uniqArrays( [
				[ 'a', 'b' ],
				[ 'b', 'c' ],
			] ) ).toStrictEqual( [
				[ 'a', 'b' ],
				[ 'b', 'c' ],
			] );
		} );

		it( "should handle already duplicates", ( ) =>
		{
			expect( uniqArrays( [
				[ 'a', 'b' ],
				[ 'b', 'c' ],
				[ 'a', 'b' ],
			] ) ).toStrictEqual( [
				[ 'a', 'b' ],
				[ 'b', 'c' ],
			] );
		} );
	} );
} );
