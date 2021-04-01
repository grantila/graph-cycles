export type Edge = readonly [ from: string, to: readonly string[ ] ];

export type Graph = ReadonlyArray< Edge >;

export interface AnalysisResult
{
	cycles: Array< Array< string > >;
	entrypoints: Array< Array< string > >;
	dependencies: Array< string >;
	all: Array< string >;
}
