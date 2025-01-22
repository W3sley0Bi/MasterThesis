from SPARQLWrapper import SPARQLWrapper, JSON
import random

def foaf(foaf_class, n=5):
    """
    Fetches properties, labels, and classes for a given FOAF class and randomly selects n results.
    
    Parameters:
    - foaf_class (str): The FOAF class URI to query.
    - n (int): Number of results to randomly select from the query response.

    Returns:
    - list of dict: Randomly selected results with 'property', 'label', and 'class' (origin class).
    """
    sparql_endpoint = "https://lov.linkeddata.es/dataset/lov/sparql"

    query = f"""
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT ?property ?label ?class
    WHERE {{
        {{
            SELECT DISTINCT ?class
            WHERE {{
                <{foaf_class}> rdfs:subClassOf* ?parent .
                ?parent a rdfs:Class .
                BIND(?parent AS ?class)
            }}
        }}
        ?property rdfs:domain ?class ;
                  rdfs:label ?label .
    }}
    """
    print("SPARQL Query:")
    print(query)

    # Initialize the SPARQL wrapper
    sparql = SPARQLWrapper(sparql_endpoint)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        # Execute the query
        results = sparql.query().convert()
        bindings = results["results"]["bindings"]

        # Extract and structure the results
        structured_results = [
            {
                "property": result.get("property", {}).get("value", ""),
                "label": result.get("label", {}).get("value", ""),
                "origin_class": result.get("class", {}).get("value", "")
            }
            for result in bindings
        ]

        # Randomly select n results
        random_results = random.sample(structured_results, min(n, len(structured_results)))

        return random_results

    except Exception as e:
        print(f"An error occurred: {e}")
        return []

# TODO: tomorrow continuue form here. you want to append the property to the classes that are generated. only to the one that the user didn't declare.