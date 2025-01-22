from rdflib import Graph, RDF, RDFS, URIRef, Literal
from scanner import scan
from generate_instance import generate_instance

def save_to_new_ttl_file(original_graph, new_instances_graph, output_file):
    # Combine prefixes and class definitions
    combined_graph = Graph()
    for prefix, namespace in original_graph.namespace_manager.namespaces():
        combined_graph.namespace_manager.bind(prefix, namespace)

    # Add all triples from the original graph
    for triple in original_graph:
        combined_graph.add(triple)

    # Add all triples from the new instances graph
    for triple in new_instances_graph:
        combined_graph.add(triple)

    # Serialize the combined graph to a file
    combined_graph.serialize(destination=output_file, format="turtle")
    print(f"New TTL file saved at: {output_file}")


def instance_generation_main(turtle_file, output_file):
    
    # TODO: this needs to support multiple rdf formats in the future
    original_graph = Graph()
    original_graph.parse(turtle_file, format="turtle")

    new_instances_graph = Graph()
    for prefix, namespace in original_graph.namespace_manager.namespaces():
        new_instances_graph.namespace_manager.bind(prefix, namespace)

    # Detect classes and their properties
    classes = scan(original_graph)
    property_definitions = {class_uri: details["properties"] for class_uri, details in classes.items()}
    # Generate instances for each class and add to the new graph
    for class_uri in classes:
        instances = generate_instance(class_uri, new_instances_graph, num_instances=1, property_definitions=property_definitions)
        print(f"Generated instances for class {class_uri}: {instances}")

    # Save the combined graph (original + new instances) to a new TTL file
    save_to_new_ttl_file(original_graph, new_instances_graph, output_file)


# TESTING
# python3 src/modules/instance_generation/instance_generation_main.py
turtle_file = "test.ttl"  
output_file = "output.ttl" 
instance_generation_main(turtle_file, output_file)
