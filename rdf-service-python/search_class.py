from rdflib import Graph, RDF, RDFS
from urllib.parse import urlparse
import asyncio
from fetch_examples import fetch_example
from instance_generation import generate_rdf_instances, serialize_rdf_graph
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

async def fetch_classes():
    print("Subjects of rdf:type rdfs:Class:")
    print(classes)
    ai_generation(fetch_example(get_local_name(str(cls))) for cls in classes)
    # tasks = [fetch_example(get_local_name(str(cls))) for cls in classes]
    # results = await asyncio.gather(*tasks)

    # for result in results:
    #     print(result)
    #     rdf_graph = generate_rdf_instances(result)
    #     serialize_rdf_graph(rdf_graph, "rdf_instances.ttl")

asyncio.run(fetch_classes())
