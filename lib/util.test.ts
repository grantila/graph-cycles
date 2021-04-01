import { equalArray, equalRotatedArrays, uniq, uniqArrays } from './util'

equalArray; equalRotatedArrays; uniq; uniqArrays;
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

	describe( "equalRotatedArrays", ( ) =>
	{
		it( "should handle empty", ( ) =>
		{
			expect( equalRotatedArrays( [ ], [ ] ) ).toBe( true );
		} );

		it( "should handle different sizes", ( ) =>
		{
			expect( equalRotatedArrays( [ 'a', 'b' ], [ 'a' ] ) ).toBe( false );
		} );

		it( "should handle equal unrotated", ( ) =>
		{
			expect( equalRotatedArrays(
				[ 'a', 'b', 'c' ],
				[ 'a', 'b', 'c' ]
			) ).toBe( true );
		} );

		it( "should handle equal rotated", ( ) =>
		{
			expect( equalRotatedArrays(
				[ 'a', 'b', 'c' ],
				[ 'b', 'c', 'a' ]
			) ).toBe( true );
		} );

		it( "should handle similar but non-equal", ( ) =>
		{
			expect( equalRotatedArrays(
				[ 'a', 'b', 'c' ],
				[ 'a', 'c', 'b' ]
			) ).toBe( false );
		} );

		it( "should handle different", ( ) =>
		{
			expect( equalRotatedArrays(
				[ 'a', 'b', 'c' ],
				[ 'x', 'y', 'z' ]
			) ).toBe( false );
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
