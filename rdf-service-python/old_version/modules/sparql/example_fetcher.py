import aiohttp
from .query_executor import execute_query
from .query_builder import build_yago_example_query, build_dbpedia_example_query

ENDPOINTS = {
    "yago": "https://yago-knowledge.org/sparql/query",
    "dbpedia": "https://dbpedia.org/sparql"
}

async def fetch_examples_for_match(resource_uri, source):
    print(f"[INFO] Fetching examples for resource: {resource_uri} from {source}")
    async with aiohttp.ClientSession() as session:
        query = build_dbpedia_example_query(resource_uri) if source == "dbpedia" else build_yago_example_query(resource_uri)
        endpoint = ENDPOINTS[source]
        examples = await execute_query(session, endpoint, query)
        print(f"[INFO] Total examples found: {len(examples)}")
        return examples
