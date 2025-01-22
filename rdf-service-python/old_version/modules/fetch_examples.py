import asyncio
from aiohttp import ClientSession
from modules.sparql.query_builder import build_sparql_query
from modules.sparql.match_finder import find_best_match
from modules.sparql.example_fetcher import fetch_examples_for_match
from modules.sparql.query_executor import execute_query

# SPARQL Endpoints
ENDPOINTS = {
    "yago": "https://yago-knowledge.org/sparql/query",
    "dbpedia": "https://dbpedia.org/sparql"
}

async def fetch_data(term):
    async with ClientSession() as session:
        tasks = [
            execute_query(session, endpoint, build_sparql_query(term))
            for endpoint in ENDPOINTS.values()
        ]
        responses = await asyncio.gather(*tasks)
        combined_results = [item for response in responses for item in response]
        print(f"[INFO] Total combined results: {len(combined_results)}")
        return combined_results

async def examples_list(term):
    print(f"Fetching examples for '{term}'...")
    
    # Fetch data from SPARQL endpoints
    combined_results = await fetch_data(term)

    if not combined_results:
        print("No matches found.")
        return {}

    # Find the best match for the term
    match = find_best_match(combined_results, term)
    if not match:
        print("No suitable match found.")
        return {}

    resource_uri = match.get("class", {}).get("value", match.get("entity", {}).get("value", ""))
    source = "dbpedia" if "dbpedia.org" in resource_uri else "yago"
    
    # Fetch examples for the best match
    examples = await fetch_examples_for_match(resource_uri, source)
    return {"match": match, "examples": examples}



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
    