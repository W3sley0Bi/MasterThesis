from rdflib import URIRef
from .vocabularies_dict import vocabularies
from .queries.foaf import foaf
from .queries.schema import schema

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
    

def find_properties(classes):
    result = get_undeclared_classes(classes)
    matches = check_uri(result)
    for match in matches:
        match matches[match]:
            case "foaf": 
                result = foaf(match,5)
                print(result)
            # case "schema": schema(match)
            case _: 
                print("ontology non supported yet")
        
        
    return matches

