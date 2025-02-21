# MasterThesis
Development of IDE extensions for artificial, schema-driven generation and visualization of RDF A-Box Resources

The Resource Description Framework (RDF) is a standard for describing resources on the web.
RDF extends the Web’s linking structure by using URIs to name the relationships between
resources and the two ends of the link. It is designed for machine readability rather than human
readability.
Developers often struggle with the time-consuming and complex task of manually generating
example instances for new RDF schemas, which can lower their productivity and the seamless
integration of these schemas into software projects.
This thesis aims to improve the user-friendliness visualization of RDF schema, by using a code
editor extension that allows not just to better visualize the schema and the relations within but
also provides automatically generated example instances for a better understanding.
The main challenge for this project is the User Interface Design. RDF data is structured as a
graph of triples (subject-predicate-object), which can be difficult to represent visually. Unlike
traditional tabular data, RDF’s graph-based nature requires a UI that can effectively display
nodes and their relationships. RDF schemas can vary widely in structure and content. Designing
a UI that can dynamically adapt to different schemas and data types while remaining clear is a
significant challenge. The UI should handle many types of vocabularies and ontologies.
Addressing this challenge will require regular software/web development knowledge but also a
deep understanding of the Semantic web and its technologies, like RDFs and SPARQL.

The project has three folders: 
1. the Master Thesis   
2. the VSCode extension
3. the Web Service

## Installation Devs
To run the app in a development environment, follow these steps:

### Web Service

#### Prerequisites
- Python 3.11
- pip 
- pipenv
- fastapi

#### Run
- cd in "rdf-service-python" folder
- run `fastapi dev src/main.py --host 0.0.0.0 --port 8000`


### VSCode Extension

#### Prerequisites
- VSCode installed
- Node.js LTS
- npm

#### Run
- open and focus the `extension.ts` file
- press `command + shift + P` and execute `Start Debugging`
- go the new vscode dev window, press `command + shift + P` and execute `RIGSV view graph`
- you can also open the menu setting by clicking on `RIGSV options` in the bottom right corner of the vscode dev window

## Installation Users

### Web Service

#### Prerequisites
- Docker

#### Run
- cd in "rdf-service-python" folder
    - run `docker compose up`
    <!-- - to re build the image and container run `docker-compose up --build -d` -->
    <!-- - to shut down run `docker compose down`
    - to log  run `docker-compose logs -f` -->

### VSCode Extension

#### Prerequisites
- VSCode installed

#### installation in VSCode
- install the `rdf-instance-generator-schema-visualizer--rigsv-0.0.1.vsix` file like a normal vscode extension (drag and drop in vscode)

