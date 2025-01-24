from rdflib import Namespace, Literal, RDF, URIRef
from rdflib.namespace import XSD



# Define the example namespace
EX = Namespace("http://example.org/")


def generate_instance(
    class_uri,
    graph,
    num_instances=1,
    property_definitions=None,
    processed_instances=None,
    initialized_instances=None,
):
    from rdflib.namespace import XSD

    # Predefined default values for common XSD types
    xsd = {
        "http://www.w3.org/2001/XMLSchema#integer": 0,
        "http://www.w3.org/2001/XMLSchema#decimal": 0.0,
        "http://www.w3.org/2001/XMLSchema#float": 0.0,
        "http://www.w3.org/2001/XMLSchema#double": 0.0,
        "http://www.w3.org/2001/XMLSchema#string": "unknown",
        "http://www.w3.org/2001/XMLSchema#token": "token_value",
        "http://www.w3.org/2001/XMLSchema#normalizedString": "normalized value",
        "http://www.w3.org/2001/XMLSchema#date": "1970-01-01",
        "http://www.w3.org/2001/XMLSchema#time": "00:00:00",
        "http://www.w3.org/2001/XMLSchema#dateTime": "1970-01-01T00:00:00Z",
        "http://www.w3.org/2001/XMLSchema#duration": "P0Y0M0DT0H0M0S",
        "http://www.w3.org/2001/XMLSchema#gYear": "2025",
        "http://www.w3.org/2001/XMLSchema#gYearMonth": "2025-01",
        "http://www.w3.org/2001/XMLSchema#gMonthDay": "--01-24",
        "http://www.w3.org/2001/XMLSchema#gDay": "---24",
        "http://www.w3.org/2001/XMLSchema#gMonth": "--01",
        "http://www.w3.org/2001/XMLSchema#boolean": False,
        "http://www.w3.org/2001/XMLSchema#base64Binary": "",
        "http://www.w3.org/2001/XMLSchema#hexBinary": "",
        "http://www.w3.org/2001/XMLSchema#nonPositiveInteger": 0,
        "http://www.w3.org/2001/XMLSchema#negativeInteger": -1,
        "http://www.w3.org/2001/XMLSchema#long": 0,
        "http://www.w3.org/2001/XMLSchema#int": 0,
        "http://www.w3.org/2001/XMLSchema#short": 0,
        "http://www.w3.org/2001/XMLSchema#byte": 0,
        "http://www.w3.org/2001/XMLSchema#nonNegativeInteger": 0,
        "http://www.w3.org/2001/XMLSchema#unsignedLong": 0,
        "http://www.w3.org/2001/XMLSchema#unsignedInt": 0,
        "http://www.w3.org/2001/XMLSchema#unsignedShort": 0,
        "http://www.w3.org/2001/XMLSchema#unsignedByte": 0,
        "http://www.w3.org/2001/XMLSchema#positiveInteger": 1,
        "http://www.w3.org/2001/XMLSchema#QName": "QName",
        "http://www.w3.org/2001/XMLSchema#NOTATION": "Notation",
    }




    
    # Skip generating instances for primitive types
    if (str(class_uri).startswith("http://www.w3.org/2001/XMLSchema#")):
        return []

    instances = []
    processed_instances = processed_instances or {}
    initialized_instances = initialized_instances or {}

    # Extract the class name for generating human-readable instance names
    class_name = class_uri.split("/")[-1]

    for i in range(num_instances):
        # Generate a unique URI for the instance under the `ex:` namespace
        instance_uri = EX[f"{class_name}_Instance{i + 1}"]

        # If the instance is already processed, reuse it
        if instance_uri in processed_instances:
            instances.append(instance_uri)
            continue

        # Mark the instance as processed
        processed_instances[instance_uri] = True

        # Add the triple (instance, rdf:type, class)
        graph.add((instance_uri, RDF.type, class_uri))
        # Initialize properties for the class
        if property_definitions and class_uri in property_definitions:
            for prop, value in property_definitions[class_uri].items():
                if isinstance(value, URIRef):
                    if(str(value).startswith("http://www.w3.org/2001/XMLSchema#")):
                        graph.add((instance_uri, prop, Literal(xsd[str(value)], datatype=value)))
                    else:
                        graph.add((instance_uri, prop, value))
                elif isinstance(value, Literal):
                    graph.add((instance_uri, prop, value))
                else:
                    raise ValueError(f"Unsupported value type: {type(value)} for property {prop}")

                if instance_uri not in initialized_instances:
                    initialized_instances[instance_uri] = set()
                initialized_instances[instance_uri].add(prop)

        # Add the instance URI to the results
        instances.append(instance_uri)

    return instances


    
    