from SPARQLWrapper import SPARQLWrapper, JSON
import random
from .vocabularies_dict import vocabularies

vocab = vocabularies()


def fetchQuery(class_term, ontology):
    queries = {
    "foaf": f"""
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        SELECT DISTINCT ?property ?label ?class ?exampleValue
        WHERE {{
            {{
                SELECT DISTINCT ?class
                WHERE {{
                    <{class_term}> rdfs:subClassOf* ?parent .
                    ?parent a rdfs:Class .
                    BIND(?parent AS ?class)
                }}
            }}
            ?property rdfs:domain ?class ;
                    rdfs:label ?label ;
                    rdfs:range ?range .
                    
            ?subject ?property ?exampleValue .

        }}
        """,
    "schema": f"""
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>

        SELECT DISTINCT ?property ?label ?class ?exampleValue
        WHERE {{
            {{
                SELECT DISTINCT ?class
                WHERE {{
                    <{class_term}> rdfs:subClassOf* ?parent .
                    ?parent a rdfs:Class .
                    BIND(?parent AS ?class)
                }}
            }}
            ?property schema:domainIncludes ?class ;
                    rdfs:label ?label ;
                    rdfs:range ?range .
                    
            ?subject ?property ?exampleValue .
        }}
        """
    }
    
    return queries[ontology]


def query(class_term, n, ontology):
    
    base_uri = vocab[ontology]
    
    sparql_endpoint = "https://lov.linkeddata.es/dataset/lov/sparql"
    
    
    query = fetchQuery(class_term, ontology)
  

    # Initialize the SPARQL wrapper
    sparql = SPARQLWrapper(sparql_endpoint)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:

        results = sparql.query().convert()
        
        
        # TODO: speed up this process
        print(results)
        
        
        
        bindings = results["results"]["bindings"]
        structured_results = [
            {
                "property": result.get("property", {}).get("value", ""),
                "label": result.get("label", {}).get("value", ""),
                "exampleValue": result.get("exampleValue", {}).get("value", ""),
                "origin_class": result.get("class", {}).get("value", "")
            }
            for result in bindings
        ]
 
        filtered_results = [
            result for result in structured_results
            if result["property"].startswith(base_uri) and result["origin_class"].startswith(base_uri)
        ]

        random_results = random.sample(filtered_results, min(n, len(filtered_results)))
        return random_results
        
    except Exception as e:
        print(f"An error occurred: {e}")
        return []
