from rdflib import Graph, RDF, RDFS
from urllib.parse import urlparse
import asyncio
from .fetch_examples import examples_list
from .instance_generation import generate_rdf_instances, serialize_rdf_graph
from AI import ai_generation

def get_local_name(uri):
    return uri.split("/")[-1] if "/" in uri else uri.split(":")[-1]

g = Graph()
g.parse("test.ttl", format="ttl")

classes = set()
for subj, pred, obj in g.triples((None, RDF.type, RDFS.Class)):
    classes.add(subj)

instances = {}
for subj, pred, obj in g.triples((None, RDF.type, None)):
    if obj in classes:
        instances[subj] = obj


def extract_base_and_value(uri_refs):
    result = []
    for uri in uri_refs:
        url = str(uri)
        base_url, value = url.rsplit('/', 1)
        result.append({"baseurl": base_url, "value": value})
    return result

async def fetch_classes():
    print("Subjects of rdf:type rdfs:Class:")
    extracted_data = extract_base_and_value(classes)
    ai_generation(extracted_data[0]['value'])
    # for item in extracted_data:
    #     print(item)
    # ai_generation(extracted_data)
    # tasks = [examples_list(get_local_name(str(cls))) for cls in classes]
    # results = await asyncio.gather(*tasks)

    # for result in results:
    #     print(result)
        # rdf_graph = generate_rdf_instances(result)
        # serialize_rdf_graph(rdf_graph, "rdf_instances.ttl")
