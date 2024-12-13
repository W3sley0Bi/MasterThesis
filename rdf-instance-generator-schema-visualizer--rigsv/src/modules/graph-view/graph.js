const graph = new graphology.Graph();
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) {
  console.error('WebGL not supported in this environment');
} else {
  console.log('WebGL initialized successfully');
}

// Helper function to add nodes and edges
const addNodeIfNotExists = (id, attributes = {}) => {
  if (!graph.hasNode(id)) {
    // Add random x and y coordinates if not provided
    const x = Math.random() * 100; // Random value between 0 and 100
    const y = Math.random() * 100;
    graph.addNode(id, { x, y, size: 10, color: 'blue', label: id, ...attributes });
  }
};

const addEdgeIfNotExists = (source, target, attributes = {}) => {
  if (!graph.hasEdge(source, target)) {
    graph.addEdge(source, target, attributes);
  }
};

try {
  // Listen for the message event
  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'setRDFContent') {
      const rdfContent = message.content;
      console.log(rdfContent);

      // Parse RDF data and populate the graph
      rdfContent.forEach((quad) => {
        const subjectId = quad.subject.value;
        const predicate = quad.predicate.value;
        const object = quad.object;

        // Add subject node
        addNodeIfNotExists(subjectId, { label: subjectId });

        // Handle different object types
        if (object.termType === 'NamedNode' || object.termType === 'BlankNode') {
          const objectId = object.value;
          addNodeIfNotExists(objectId, { label: objectId });

          // Add edge for the predicate
          addEdgeIfNotExists(subjectId, objectId, { label: predicate });
        } else if (object.termType === 'Literal') {
          // Add literal as a node
          const literalId = `${subjectId}_${predicate}`;
          addNodeIfNotExists(literalId, {
            label: `${predicate}: ${object.value}`,
            color: 'gray',
            size: 5,
          });

          // Connect literal node to subject
          addEdgeIfNotExists(subjectId, literalId, { label: predicate });
        }
      });

      // Instantiate Sigma.js only once
      const container = document.getElementById('container');
      if (!container.sigmaInstance) {
        // Ensure Sigma instance is not recreated
        container.sigmaInstance = new Sigma(graph, container);
      }
    }
  });
} catch (error) {
  console.error('Error initializing Sigma.js:', error);
}


//todo: atlas2

// // Helper function to load the Force Atlas 2 layout from the CDN
// const applyForceAtlas2Layout = (graph) => {
//   if (typeof graph !== "object" || graph === null) {
//     console.error("Invalid graph instance for Force Atlas 2 layout.");
//     return;
//   }

//   const forceAtlas2Settings = {
//     iterations: 100, // Number of iterations for layout adjustment
//     settings: {
//       gravity: 1, // Pull nodes toward the center
//       scalingRatio: 2, // Adjust node spacing
//       barnesHutOptimize: true, // Optimize performance for large graphs
//     },
//   };

//   // Apply Force Atlas 2 layout
//   const { assign } = graphologyLayoutForceAtlas2;
//   assign(graph, forceAtlas2Settings);
// };

// try {
//   const graph = new graphology.Graph();

//   // Helper function to add nodes and edges
//   const addNodeIfNotExists = (id, attributes = {}) => {
//     if (!graph.hasNode(id)) {
//       const x = Math.random() * 100; // Random initial x-coordinate
//       const y = Math.random() * 100; // Random initial y-coordinate
//       graph.addNode(id, { x, y, size: 10, color: "blue", label: id, ...attributes });
//     }
//   };

//   const addEdgeIfNotExists = (source, target, attributes = {}) => {
//     if (!graph.hasEdge(source, target)) {
//       graph.addEdge(source, target, attributes);
//     }
//   };

//   // Listener for messages to dynamically populate the graph
//   window.addEventListener("message", (event) => {
//     const message = event.data;

//     if (message.command === "setRDFContent") {
//       const rdfContent = message.content;

//       if (!rdfContent || !Array.isArray(rdfContent)) {
//         console.error("Invalid RDF content received. Expected an array of RDF quads.");
//         return;
//       }

//       try {
//         // Parse RDF content and add nodes and edges
//         rdfContent.forEach((quad, index) => {
//           if (!quad.subject || !quad.predicate || !quad.object) {
//             console.warn(`Malformed RDF quad at index ${index}:`, quad);
//             return; // Skip malformed quad
//           }

//           const subjectId = quad.subject.value;
//           const predicate = quad.predicate.value;
//           const object = quad.object;

//           // Add subject node
//           addNodeIfNotExists(subjectId, { label: subjectId });

//           if (object.termType === "NamedNode" || object.termType === "BlankNode") {
//             const objectId = object.value;
//             addNodeIfNotExists(objectId, { label: objectId });

//             // Add edge between subject and object
//             addEdgeIfNotExists(subjectId, objectId, { label: predicate });
//           } else if (object.termType === "Literal") {
//             // Add literal as a separate node and connect to subject
//             const literalId = `${subjectId}_${predicate}`;
//             addNodeIfNotExists(literalId, {
//               label: `${predicate}: ${object.value}`,
//               color: "gray",
//               size: 5,
//             });

//             // Add edge connecting the subject and literal node
//             addEdgeIfNotExists(subjectId, literalId, { label: predicate });
//           }
//         });

//         // Apply the Force Atlas 2 layout (via CDN)
//         applyForceAtlas2Layout(graph);

//         // Render the graph using Sigma.js
//         const container = document.getElementById("container");
//         if (!container.sigmaInstance) {
//           container.sigmaInstance = new Sigma(graph, container);
//         } else {
//           console.warn("Sigma instance already exists. Reusing the existing instance.");
//         }
//       } catch (parseError) {
//         console.error("Error while parsing RDF content:", parseError);
//       }
//     }
//   });
// } catch (error) {
//   console.error("Error initializing Sigma.js:", error);
// }
