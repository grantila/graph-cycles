import { equalArray, uniq, uniqArrays } from './util'


describe( "utils", ( ) =>
{
	describe( "equalArray", ( ) =>
	{
		it( "should handle empty", ( ) =>
		{
			expect( equalArray( [ ], [ ] ) ).toBe( true );
		} );

		it( "should handle different sizes", ( ) =>
		{
			expect( equalArray( [ 'a', 'b' ], [ 'a' ] ) ).toBe( false );
		} );

		it( "should handle equal", ( ) =>
		{
			expect( equalArray( [ 'a', 'b' ], [ 'a', 'b' ] ) ).toBe( true );
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
