-- Enable trigram fuzzy matching and accent-insensitive search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent() is STABLE, not IMMUTABLE, so it can't back a functional index
-- directly. Wrap it in an IMMUTABLE function for indexing/search purposes.
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
SELECT public.unaccent($1)
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

-- Trigram index on normalized (lowercased, unaccented) game name.
-- Not yet used by the fuzzy-search query (see gameService.ts), which calls
-- word_similarity() directly for correctness; kept here so it's available
-- once the query is switched to index-friendly trigram operators.
CREATE INDEX games_name_trgm_idx ON games USING GIN (immutable_unaccent(lower(name)) gin_trgm_ops);