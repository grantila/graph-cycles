export type Edge = readonly [ from: string, to: readonly string[ ] ];

export type Graph = ReadonlyArray< Edge >;

export interface FastAnalysisResult
{
	cyclic: Array< string >;
	dependencies: Array< string >;
	dependents: Array< string >;
}

export interface FullAnalysisResult
{
	cycles: Array< Array< string > >;
	entrypoints: Array< Array< string > >;
	dependencies: Array< string >;
	dependents: Array< string >;
	all: Array< string >;
}
