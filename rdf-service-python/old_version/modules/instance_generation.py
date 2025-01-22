from rdflib import Graph, Namespace, RDF, RDFS, Literal, URIRef

EX = Namespace("http://example.org/")
YAGO = Namespace("http://yago-knowledge.org/resource/")
DBPEDIA = Namespace("http://dbpedia.org/resource/")

def generate_rdf_instances(data):
    graph = Graph()
    graph.bind("ex", EX)
    graph.bind("yago", YAGO)
    graph.bind("dbpedia", DBPEDIA)
    graph.bind("rdfs", RDFS)
    
    if isinstance(data, dict):
        data = [data]
    
    for item in data:
        # Use the original user-provided category URI as the main class
        category_uri = URIRef(item.get('match', {}).get('class', {}).get('value', 'http://example.org/DefaultCategory'))
        category_label = Literal(item.get('category_name', 'Unknown'))
        
        # Define the user-provided category class in RDF
        graph.add((category_uri, RDF.type, RDFS.Class))
        graph.add((category_uri, RDFS.label, category_label))
        graph.add((category_uri, RDFS.comment, Literal(f"A {category_label} category")))
        
        # Process the 'examples' list
        for example_entry in item.get('examples', []):
            linked_page_uri = URIRef(example_entry.get('linkedPage', {}).get('value', ''))
            if linked_page_uri:
                graph.add((linked_page_uri, RDF.type, category_uri))
                graph.add((linked_page_uri, RDFS.comment, Literal(f"Linked page instance of {category_label}")))
    
    return graph

# Serialize the RDF Graph
def serialize_rdf_graph(graph, output_file):
    with open(output_file, "w") as f:
        f.write(graph.serialize(format="turtle"))

# # Example data for testing
# test_data = {
#     'category_name': 'Public_Blockchain',
#     'match': {
#         'class': {'type': 'uri', 'value': 'http://dbpedia.org/resource/Public_Blockchain'},
#         'classLabel': {'type': 'literal', 'xml:lang': 'en', 'value': 'Public Blockchain'}
#     },
#     'examples': [
#         {'linkedPage': {'type': 'uri', 'value': 'http://dbpedia.org/resource/Blockchain'}},
#         {'linkedPage': {'type': 'uri', 'value': 'http://dbpedia.org/resource/Cardano_(blockchain_platform)'}},
#         {'linkedPage': {'type': 'uri', 'value': 'http://dbpedia.org/resource/PricewaterhouseCoopers'}},
#         {'linkedPage': {'type': 'uri', 'value': 'http://dbpedia.org/resource/Privacy_and_blockchain'}},
#         {'linkedPage': {'type': 'uri', 'value': 'http://dbpedia.org/resource/Pseudonym'}},
#         {'linkedPage': {'type': 'uri', 'value': 'http://dbpedia.org/resource/Saraju_Mohanty'}}
#     ]
# }

# # Testing the function
# if __name__ == "__main__":
#     rdf_graph = generate_rdf_instances(test_data)
#     serialize_rdf_graph(rdf_graph, "output.ttl")
#     print("RDF graph generated and saved as output.ttl")



############################################################################## OLD YAGO
# from rdflib import Graph, Namespace, RDF, RDFS, Literal, URIRef

# # Define Namespaces
# EX = Namespace("http://example.org/")
# YAGO = Namespace("http://yago-knowledge.org/resource/")

# # Function to Generate RDF Instances from JSON-like Object
# def generate_rdf_instances(data):
#     graph = Graph()
#     graph.bind("ex", EX)
#     graph.bind("yago", YAGO)
#     graph.bind("rdfs", RDFS)
    
#     for category, items in data.items():
#         class_uri = EX[category]
        
#         # Define the category class in RDF
#         graph.add((class_uri, RDF.type, RDFS.Class))
#         graph.add((class_uri, RDFS.label, Literal(category)))
#         graph.add((class_uri, RDFS.comment, Literal(f"A {category.lower()} category")))
        
#         for item in items:
#             # Iterate through examples
#             for key in item:
#                 if key.startswith("examples-"):
#                     for example_entry in item[key]:
#                         # Use the original URI from the JSON for the example instance
#                         example_instance_uri = URIRef(example_entry['example']['value'])
#                         example_label = Literal(example_entry['label']['value'])
                        
#                         # Link the original example URI to the category class
#                         graph.add((example_instance_uri, RDF.type, class_uri))
#                         graph.add((example_instance_uri, RDFS.label, example_label))
#                         graph.add((example_instance_uri, RDFS.comment, Literal(f"Instance of {category} example")))
    
#     return graph

# # Serialize the RDF Graph
# def serialize_rdf_graph(graph, output_file):
#     with open(output_file, "w") as f:
#         f.write(graph.serialize(format="turtle"))