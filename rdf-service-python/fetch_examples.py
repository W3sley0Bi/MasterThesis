import aiohttp
import asyncio
from difflib import SequenceMatcher

# Define SPARQL Endpoints
ENDPOINTS = {
    "yago": "https://yago-knowledge.org/sparql/query",
    "dbpedia": "https://dbpedia.org/sparql"
}

# Generate SPARQL Query
def build_sparql_query(term, search_type="class"):
    query_var = "class" if search_type == "class" else "entity"
    return f"""
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?{query_var} ?{query_var}Label
        WHERE {{
          ?{query_var} rdfs:label ?{query_var}Label .
          FILTER(LANG(?{query_var}Label) = "en")
          FILTER(CONTAINS(LCASE(?{query_var}Label), "{term.lower()}"))
        }}
        LIMIT 100
    """

# DBpedia Example Query: Fetch all dbo:wikiPageWikiLink values for the resource
def build_dbpedia_example_query(resource_uri):
    return f"""
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT DISTINCT ?linkedPage
        WHERE {{
          <{resource_uri}> dbo:wikiPageWikiLink ?linkedPage .
        }}
        LIMIT 5
    """


# YAGO Example Query: Fetch related entities
def build_yago_example_query(resource_uri):
    return f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT (SAMPLE(?subject) AS ?example) ?label
        WHERE {{
        ?subject rdf:type <{resource_uri}> .
        ?subject rdfs:label ?label .
        FILTER(LANG(?label) = "en")
        }}
        GROUP BY ?label
        ORDER BY RAND()
        LIMIT 5
    """

# Execute SPARQL Query with Error Handling (using GET method)
async def execute_query(session, endpoint, query):
    params = {"query": query, "format": "json"}
    headers = {"Accept": "application/sparql-results+json"}
    try:
        async with session.get(endpoint, params=params, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                if "results" in data and "bindings" in data["results"]:
                    print(f"[INFO] Results from {endpoint}: {len(data['results']['bindings'])} items")
                    return data["results"]["bindings"]
            print(f"[WARN] No valid results from {endpoint}")
            return []
    except Exception as e:
        print(f"[ERROR] Query failed for {endpoint}: {e}")
        return []

# Find the Best Matching Result
def find_best_match(results, term):
    best_match, best_score = None, 0
    for result in results:
        label = result.get("classLabel", {}).get("value", "") or result.get("entityLabel", {}).get("value", "")
        if not label:
            continue
        score = SequenceMatcher(None, label.lower(), term.lower()).ratio()
        if score > best_score:
            best_match, best_score = result, score
    print(f"[INFO] Best match score: {best_score}")
    return best_match

# Fetch Data from Multiple Endpoints
async def fetch_data(term):
    async with aiohttp.ClientSession() as session:
        tasks = [execute_query(session, endpoint, build_sparql_query(term)) for endpoint in ENDPOINTS.values()]
        responses = await asyncio.gather(*tasks)
        combined_results = [item for response in responses for item in response]
        print(f"[INFO] Total combined results: {len(combined_results)}")
        return combined_results

# Fetch Example Instances for the Best Match
async def fetch_examples_for_match(resource_uri, source):
    print(f"[INFO] Fetching examples for resource: {resource_uri} from {source}")
    async with aiohttp.ClientSession() as session:
        query = build_dbpedia_example_query(resource_uri) if source == "dbpedia" else build_yago_example_query(resource_uri)
        endpoint = ENDPOINTS[source]
        examples = await execute_query(session, endpoint, query)
        print(f"[INFO] Total examples found: {len(examples)}")
        return examples


async def fetch_example(term):
    print(f"\n[INFO] Fetching examples for '{term}'...")
    combined_results = await fetch_data(term)

    if not combined_results:
        print("[INFO] No matches found.")
        return {}

    match = find_best_match(combined_results, term)
    if match:
        print(f"[INFO] Best match found: {match}")
        resource_uri = match.get("class", {}).get("value", match.get("entity", {}).get("value", ""))
        source = "dbpedia" if "dbpedia.org" in resource_uri else "yago"
        examples = await fetch_examples_for_match(resource_uri, source)
        if len(examples) == 1:
            print("[INFO] Only one example found. Fetching more examples from the matched URI...")
            more_examples = await fetch_examples_for_match(examples[0]['linkedPage']['value'], source)
            examples.extend(more_examples)
        return {"match": match, "examples": examples}
    else:
        print("[INFO] No suitable match found.")
        return {}




# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# OLD WORKING QUERY FOR YAGO ONLY
# import aiohttp
# import asyncio
# from rdflib import Graph, Namespace, RDF, URIRef, Literal
# from rdflib.namespace import RDFS
# from difflib import SequenceMatcher
# import json
# import sys
# import time
# # from instance_generation import generate_instance

# example_instances_array = {}

# ENDPOINT = "https://yago-knowledge.org/sparql/query"

# def sparql_search_class(term, search_type="class"):
#     if search_type == "class":
#         return f"""
#         PREFIX schema: <http://schema.org/>
#         PREFIX yago: <http://yago-knowledge.org/resource/>
#         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
#         SELECT ?class ?classLabel
#         WHERE {{
#           ?class a rdfs:Class ;
#                  rdfs:label ?classLabel .
#           FILTER(LANG(?classLabel) = "en")
#           FILTER(CONTAINS(LCASE(?classLabel), "{term.lower()}"))
#         }}
#         LIMIT 50
#         """
#     elif search_type == "name":
#         return f"""
#         PREFIX schema: <http://schema.org/>
#         PREFIX yago: <http://yago-knowledge.org/resource/>
#         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
#         SELECT ?entity ?entityLabel
#         WHERE {{
#           ?entity rdfs:label ?entityLabel .
#           FILTER(LANG(?entityLabel) = "en")
#           FILTER(CONTAINS(LCASE(?entityLabel), "{term.lower()}"))
#         }}
#         LIMIT 50
#         """

# def sparql_search_examples(resource_type):
#     return f"""
#     PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
#     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

#     SELECT DISTINCT (SAMPLE(?subject) AS ?example) ?label
#     WHERE {{
#       ?subject rdf:type <{resource_type}> .
#       ?subject rdfs:label ?label .
#       FILTER(LANG(?label) = "en")
#     }}
#     GROUP BY ?label
#     ORDER BY RAND()
#     LIMIT 100
#     """

# async def query_sparql(query):
#     headers = {
#         "Content-Type": "application/x-www-form-urlencoded",
#         "Accept": "application/sparql-results+json"
#     }
#     async with aiohttp.ClientSession() as session:
#         try:
#             async with session.post(ENDPOINT, data={"query": query}, headers=headers) as response:
#                 if response.status == 200:
#                     try:
#                         return await response.json()  
#                     except Exception as e:
#                         print(f"\n[Error] Failed to parse JSON: {e}")
#                         return None
#                 else:
#                     print(f"\n[Error] HTTP {response.status} from {ENDPOINT}")
#                     return None
#         except Exception as e:
#             print(f"\n[Error] Querying {ENDPOINT}: {e}")
#             return None

# def find_best_match(results, term):
#     best_match = None
#     best_score = 0

#     def compute_similarity(label, term):
#         return SequenceMatcher(None, label.lower(), term.lower()).ratio()

#     for entry in results:
#         label = entry.get("classLabel", {}).get("value", "") or entry.get("entityLabel", {}).get("value", "")
#         if label.lower() == term.lower():
#             return entry

#         match_score = compute_similarity(label, term)
#         if match_score > best_score:
#             best_score = match_score
#             best_match = entry

#     return best_match

# # Loading animation
# def loading_animation(message):
#     for _ in range(3):
#         for dot in ". .. ...".split():
#             sys.stdout.write(f"\r{message}{dot}")
#             sys.stdout.flush()
#             time.sleep(0.5)
#     print("\r", end="")

# async def fetch_example(term):
#     print(f"\n[INFO] Starting search for {term}...")
#     loading_animation("Searching for classes")

#     class_query = sparql_search_class(term, search_type="class")
#     class_results = await query_sparql(class_query)
    
#     print(f"\n[INFO] Class results for {term}", class_results)
    
#     loading_animation(f"Searching for entities for {term}")

#     name_query = sparql_search_class(term, search_type="name")
#     name_results = await query_sparql(name_query)
    
#     print(f"\n[INFO] Label search results for {term}", name_results)

#     # Parse results
#     results = []
#     if class_results and "results" in class_results:
#         results.extend(class_results["results"]["bindings"])
#     if name_results and "results" in name_results:
#         results.extend(name_results["results"]["bindings"])

#     # Find the best match
#     match = find_best_match(results, term)

    
    
#     if match:
#         print(f"\n[INFO] Best match found: {match}")
#         example_query = sparql_search_examples(match["class"]["value"])
#         examples_results = await query_sparql(example_query)
        
#         i = 0 
        
#         for example in examples_results["results"]["bindings"]:
#             # generate example instance and append to example instance file
#             # generate_instance(example)
#             match.setdefault(f'examples-{i}', []).append(example)
#             i = i + 1
            
#         example_instances_array.setdefault(f'{term}', []).append(match)
#     else:
#         print("\n[INFO] No suitable match found.")
#     return example_instances_array
    