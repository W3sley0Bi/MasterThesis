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