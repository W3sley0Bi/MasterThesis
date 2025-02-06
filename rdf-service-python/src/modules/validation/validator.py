from rdflib import Graph

EXTENSION_TO_FORMAT = {
    ".rdf": "xml",
    ".xml": "xml",
    ".n3": "n3",
    ".ttl": "turtle",
    ".jsonld": "json-ld",
    ".nt": "nt",
}

def get_file_extension(file_name):
    return '.' + file_name.split('.')[-1] if '.' in file_name else ''

async def is_valid_rdf(file):
    file_extension = get_file_extension(file.filename)

    if file_extension not in EXTENSION_TO_FORMAT:
        # TODO: Handle better response -> because of invalid file format
        return False

    try:
        content = await file.read()
        await file.seek(0)  # Reset file pointer
        
        # Try parsing it with RDFlib using the correct format
        graph = Graph()
        graph.parse(data=content.decode("utf-8"), format=EXTENSION_TO_FORMAT[file_extension])
        return True 
    except Exception as e:
        print(f"Invalid RDF file: {e}")
        # TODO: Handle better response -> because of invalid file syntax
        return False
    

async def getGraph(file):
    file_extension = get_file_extension(file.filename)
    
    if file_extension not in EXTENSION_TO_FORMAT:
        return None 
    
    try:
        # Parse RDF
        graph = Graph()
        graph.parse(file.file, format=EXTENSION_TO_FORMAT[file_extension])

        return graph, file_extension, EXTENSION_TO_FORMAT[file_extension]
    except Exception as e:
        print(f"Error converting RDF to Turtle: {e}")
        return None

