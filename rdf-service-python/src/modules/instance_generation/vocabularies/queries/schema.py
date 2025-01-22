from SPARQLWrapper import SPARQLWrapper, JSON

def schema(schema_class):
    
    sparql_endpoint = "https://lov.linkeddata.es/dataset/lov/sparql"

    query = f"""
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?property ?label ?class
        WHERE {{
            {{
                SELECT DISTINCT ?class
                WHERE {{
                    <{schema_class}> rdfs:subClassOf* ?parent .
                    ?parent a rdfs:Class .
                    BIND(?parent AS ?class)
                }}
            }}
            ?property schema:domainIncludes ?class ;
                    rdfs:label ?label .
        }}
    """
    print(query)

    # Initialize the SPARQL wrapper
    sparql = SPARQLWrapper(sparql_endpoint)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        # Execute the query
        results = sparql.query().convert()

        # Log the results
        print("Results:")
        for result in results["results"]["bindings"]:
            property_ = result.get("property", {}).get("value", "")
            label = result.get("label", {}).get("value", "")
            class_ = result.get("class", {}).get("value", "")
            print(f"Property: {property_}, Label: {label}, Class: {class_}")
    except Exception as e:
        print(f"An error occurred: {e}")

