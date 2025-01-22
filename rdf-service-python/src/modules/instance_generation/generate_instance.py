from rdflib import Graph, RDF, RDFS, URIRef, Literal
import random



def generate_random_value(datatype):
    if datatype == RDFS.Literal or datatype == "http://www.w3.org/2001/XMLSchema#string":
        return Literal(f"Literal_{random.randint(1, 100)}")
    elif datatype == "http://www.w3.org/2001/XMLSchema#integer":
        return Literal(random.randint(-1000, 1000))
    elif datatype == "http://www.w3.org/2001/XMLSchema#decimal":
        return Literal(round(random.uniform(-1000, 1000), 2))
    elif datatype == "http://www.w3.org/2001/XMLSchema#date":
        return Literal(f"2023-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}")
    elif datatype == "http://www.w3.org/2001/XMLSchema#boolean":
        return Literal(random.choice([True, False]))
    elif datatype == "http://www.w3.org/2001/XMLSchema#float":
        return Literal(random.uniform(-1000.0, 1000.0))
    elif datatype == "http://www.w3.org/2001/XMLSchema#double":
        return Literal(random.uniform(-1e6, 1e6))
    else:
        return Literal(f"Unknown_{random.randint(1, 100)}")


def generate_instance(class_uri, graph, num_instances=1, property_definitions=None, processed_instances=None, initialized_instances=None):
    
    instances = []
    processed_instances = processed_instances or {}
    initialized_instances = initialized_instances or {}

    for i in range(num_instances):
        # Create a unique URI for the instance
        instance_uri = URIRef(f"{class_uri}_Instance{i + 1}")

        # If the instance is already processed, reuse it
        if instance_uri in processed_instances:
            instances.append(instance_uri)
            continue

        # Mark the instance as processed
        processed_instances[instance_uri] = True
        graph.add((instance_uri, RDF.type, class_uri))

        # Initialize properties only once for the instance
        if property_definitions and class_uri in property_definitions:
            for prop, range_ in property_definitions[class_uri].items():
                # Check if the property was already initialized
                if instance_uri in initialized_instances and prop in initialized_instances[instance_uri]:
                    continue

                # Handle properties with range constraints
                if range_:
                    # Generate or find an instance of the range class
                    range_instance = next(
                        (inst for inst in graph.subjects(RDF.type, range_)),
                        None
                    )
                    if not range_instance:
                        range_instance = generate_instance(
                            range_,
                            graph,
                            num_instances=1,
                            property_definitions=property_definitions,
                            processed_instances=processed_instances,
                            initialized_instances=initialized_instances,
                        )[0]

                    # Add the property to the graph
                    graph.add((instance_uri, prop, range_instance))

                else:
                    # Handle properties with no range constraint (e.g., literals)
                    value = generate_random_value(range_) if range_ else Literal("Undefined")
                    graph.add((instance_uri, prop, value))

                # Mark the property as initialized
                if instance_uri not in initialized_instances:
                    initialized_instances[instance_uri] = set()
                initialized_instances[instance_uri].add(prop)

        # Add the instance URI to the result
        instances.append(instance_uri)

    return instances
