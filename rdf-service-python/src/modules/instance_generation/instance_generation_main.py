from rdflib import Graph, RDF, RDFS, URIRef, Literal
from .scanner import scan
from .vocabularies.find_prop import find_properties
from .generate_instance import generate_instance
import validators 
import io
from fastapi.responses import StreamingResponse

# OLD FOR TESTING
# def save_to_new_ttl_file(original_graph, new_instances_graph, output_file):
#     # Combine prefixes and class definitions
#     combined_graph = Graph()
#     for prefix, namespace in original_graph.namespace_manager.namespaces():
#         combined_graph.namespace_manager.bind(prefix, namespace)

#     # Add all triples from the original graph
#     for triple in original_graph:
#         combined_graph.add(triple)

#     # Add all triples from the new instances graph
#     for triple in new_instances_graph:
#         combined_graph.add(triple)

#     # Serialize the combined graph to a file
#     combined_graph.serialize(destination=output_file, format="turtle")
#     print(f"New TTL file saved at: {output_file}")


def save_to_new_ttl_response(original_graph, new_instances_graph):
    
    combined_graph = Graph()

    # Preserve namespaces
    for prefix, namespace in original_graph.namespace_manager.namespaces():
        combined_graph.namespace_manager.bind(prefix, namespace)

    # Add all triples from the original and new graphs
    for triple in original_graph:
        combined_graph.add(triple)

    for triple in new_instances_graph:
        combined_graph.add(triple)

    # Serialize the combined graph to a bytes buffer
    ttl_data = combined_graph.serialize(format="turtle")
    
    return ttl_data
    
    # buffer = io.BytesIO(ttl_data.encode("utf-8"))

    # # Return the Turtle file as a response
    # # TODO: check the media_type
    # return StreamingResponse(buffer, media_type="text/turtle", headers={
    #     "Content-Disposition": "attachment; filename=new_graph.ttl"
    # })



def update_props(props,new_props):
        # TODO: randomize the selection fo the props. if you have 10 props for 10 instances randomize the selection for each of your instances
    # maybe move this function in the instance generation 
    for uri, properties in new_props.items():
        class_key = URIRef(uri)  # Convert the class URI to URIRef
        if class_key in props:
            # Add each property to the existing dictionary
            for prop in properties:
                property_key = URIRef(prop['property'])
                if (validators.url(prop['exampleValue']) == True):
                    object = URIRef(prop['exampleValue'])
                else:
                    object = Literal(prop['exampleValue'])
                props[class_key][property_key] = object
        else:
            # Initialize the class with the new properties if it doesn't exist
            props[class_key] = {URIRef(prop['property']): prop['label'] for prop in properties}
        
    return props



def instance_generation_main(turtle_file,n=2,property_search=False):
    # TODO: this needs to support multiple rdf formats in the future
    original_graph = Graph()
    original_graph.parse(turtle_file, format="turtle")

    new_instances_graph = Graph()
    for prefix, namespace in original_graph.namespace_manager.namespaces():
        new_instances_graph.namespace_manager.bind(prefix, namespace)

    # Detect classes and their properties
    classes = scan(original_graph)
    property_definitions = {class_uri: details["properties"] for class_uri, details in classes.items()}
    
    if property_search == True :
        undeclared_classes_props = find_properties(classes,1)
        new_property_definitions = update_props(property_definitions,undeclared_classes_props)
        for class_uri in classes:
            generate_instance(class_uri, new_instances_graph, num_instances=n, property_definitions=new_property_definitions)
    else:
        for class_uri in classes:
            generate_instance(class_uri, new_instances_graph, num_instances=n, property_definitions=property_definitions)
      
    rdf_data = save_to_new_ttl_response(original_graph, new_instances_graph) 
    
    json_dl = rdf_format_json(rdf_data)
    
    
    return {"turtle": rdf_data, "json_dl": json_dl}
    

def rdf_format_json(data):
    g = Graph()
    g.parse(data=data, format='turtle')
    json_ld_output = g.serialize(format='json-ld')
    
    
    return json_ld_output