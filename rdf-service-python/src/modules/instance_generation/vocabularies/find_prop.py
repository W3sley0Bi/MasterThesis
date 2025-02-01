from rdflib import URIRef
from .vocabularies_dict import vocabularies
from .query import query

vocab = vocabularies()

def get_undeclared_classes(classes):
    return [str(uri) for uri, details in classes.items() if not details["declared"]]


def check_uri(uri_list):
    matches = {}

    for uri in uri_list:
        for prefix, namespace in vocab.items():
            if uri.startswith(namespace):
                matches[uri] = prefix
                break 
    return matches
    

def find_properties(classes,n):
    
    results = {}
    undeclared_classes = get_undeclared_classes(classes)
    matches = check_uri(undeclared_classes)
    for match in matches:
        match matches[match]:
            case "foaf": 
                resultQuery = query(match,n, "foaf")
                results[match] = resultQuery
            case "schema": 
                resultQuery = query(match,n, "schema")
                results[match] = resultQuery
            case "xsd":
                print("xsd goes here")
                # TODO: add xsd
            case _: 
                print(f"ontology not supported yet: {matches[match]}")
    return results  

