from rdflib import RDF, RDFS, URIRef


def detect_classes(graph):
    """
    Detect all classes, including those indirectly referenced, in the RDF graph.
    """
    classes = {}

    # Detect explicitly defined classes
    for s in graph.subjects(RDF.type, RDFS.Class):
        classes[s] = create_class_entry(graph, s, declared=True)

    # Handle indirectly referenced classes (e.g., via rdfs:subClassOf)
    for s, p, o in graph.triples((None, RDFS.subClassOf, None)):
        if o not in classes:
            classes[o] = create_class_entry(graph, o, declared=False)
        if s not in classes:
            classes[s] = create_class_entry(graph, s, declared=False)

    return classes



def detect_properties(graph, classes):
    """
    Detect all properties and associate their domains and ranges with classes.
    """
    for prop in graph.subjects(RDF.type, RDF.Property):
        domain = list(graph.objects(prop, RDFS.domain))
        range_ = list(graph.objects(prop, RDFS.range))

        # Add properties to the domain class
        for domain_class in domain:
            if domain_class not in classes:
                classes[domain_class] = create_class_entry(graph, domain_class)
            classes[domain_class]["properties"][prop] = range_[0] if range_ else None

        # Ensure the range class exists in the dictionary
        for range_class in range_:
            if range_class not in classes:
                classes[range_class] = create_class_entry(graph, range_class)


def ensure_all_classes_covered(graph, classes):
    """
    Ensure all classes indirectly referenced in any triple are included.
    """
    for s, p, o in graph:
        if (s, RDF.type, RDFS.Class) in graph and s not in classes:
            classes[s] = create_class_entry(graph, s)
        if (o, RDF.type, RDFS.Class) in graph and o not in classes:
            classes[o] = create_class_entry(graph, o)


def create_class_entry(graph, class_uri, declared=False):
    """
    Create a dictionary entry for a class, including its properties, annotations, and instances.
    """
    return {
        "properties": {},
        "annotations": {
            "label": list(graph.objects(class_uri, RDFS.label)),
            "comment": list(graph.objects(class_uri, RDFS.comment))
        },
        "instances": list(graph.subjects(RDF.type, class_uri)),
        "declared": declared  # Flag indicating if the class is explicitly declared
    }



def scan(graph):
    """
    Main function to analyze the RDF graph and detect all classes, properties, and instances.
    """
    print("Starting RDF analysis...")
    classes = detect_classes(graph)
    detect_properties(graph, classes)
    ensure_all_classes_covered(graph, classes)
    print("RDF analysis completed.")
    return classes
