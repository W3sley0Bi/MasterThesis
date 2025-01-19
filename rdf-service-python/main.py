# from rdflib import Graph, Namespace, RDF, RDFS, Literal, FOAF
# from rdflib.namespace import XSD

# # Define Namespaces
# EX = Namespace("http://example.org/")
# RDFS_NS = RDFS
# RDF_NS = RDF
# XSD_NS = XSD
# FOAF_NS = FOAF

# # Parse RDF File
# def load_rdf(file_path):
#     g = Graph()
#     g.parse(file_path, format="turtle")
#     return g

# # Extract Classes and Properties
# def extract_schema(graph):
#     classes = []
#     properties = []

#     for s, p, o in graph.triples((None, RDF.type, RDFS_NS.Class)):
#         classes.append(s)
    
#     # Include properties from both RDF.Property and actual usage
#     for s, p, o in graph:
#         if p not in properties and p != RDF.type:
#             properties.append(p)

#     return {"classes": classes, "properties": properties}

# # Generate Example Instances
# def generate_instances(graph, schema):
#     example_graph = Graph()

#     # Create an example instance for each class
#     for class_uri in schema["classes"]:
#         instance_uri = EX[f"Example{class_uri.split('/')[-1]}"]
#         example_graph.add((instance_uri, RDF.type, class_uri))

#         # Assign properties to this instance
#         for prop in schema["properties"]:
#             # Find existing usage of properties in the original graph
#             for s, p, o in graph.triples((None, prop, None)):
#                 example_graph.add((instance_uri, prop, o))
#                 break

#     return example_graph

# # Serialize the Example Graph
# def serialize_example_graph(graph, output_file):
#     with open(output_file, "w") as f:
#         f.write(graph.serialize(format="turtle"))

# # Main Function
# def main():
#     input_file = "test.ttl"
#     output_file = "example_instances.ttl"

#     # Load RDF Graph
#     rdf_graph = load_rdf(input_file)

#     # Extract Schema
#     schema = extract_schema(rdf_graph)

#     # Generate Example Instances
#     example_graph = generate_instances(rdf_graph, schema)

#     # Serialize to File
#     serialize_example_graph(example_graph, output_file)
#     print(f"Example instances written to {output_file}")

# if __name__ == "__main__":
#     main()
