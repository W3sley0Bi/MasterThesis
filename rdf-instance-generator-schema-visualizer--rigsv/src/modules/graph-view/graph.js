// const graph = new graphology.Graph();
// const canvas = document.createElement('canvas');
// const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
// if (!gl) {
//   console.error('WebGL not supported in this environment');
// } else {
//   console.log('WebGL initialized successfully');
// }

// // Helper function to add nodes and edges
// const addNodeIfNotExists = (id, attributes = {}) => {
//   if (!graph.hasNode(id)) {
//     // Add random x and y coordinates if not provided
//     const x = Math.random() * 100; // Random value between 0 and 100
//     const y = Math.random() * 100;
//     graph.addNode(id, { x, y, size: 10, color: 'blue', label: id, ...attributes });
//   }
// };

// const addEdgeIfNotExists = (source, target, attributes = {}) => {
//   if (!graph.hasEdge(source, target)) {
//     graph.addEdge(source, target, attributes);
//   }
// };

// try {
//   // Listen for the message event
//   window.addEventListener('message', (event) => {
//     const message = event.data;
//     if (message.command === 'setRDFContent') {
//       const {rdfContent} = message.content;
//       console.log(rdfContent);

//       // Parse RDF data and populate the graph
//       rdfContent.forEach((quad) => {
//         const subjectId = quad.subject.value;
//         const predicate = quad.predicate.value;
//         const object = quad.object;

//         // Add subject node
//         addNodeIfNotExists(subjectId, { label: subjectId });

//         // Handle different object types
//         if (object.termType === 'NamedNode' || object.termType === 'BlankNode') {
//           const objectId = object.value;
//           addNodeIfNotExists(objectId, { label: objectId });

//           // Add edge for the predicate
//           addEdgeIfNotExists(subjectId, objectId, { label: predicate });
//         } else if (object.termType === 'Literal') {
//           // Add literal as a node
//           const literalId = `${subjectId}_${predicate}`;
//           addNodeIfNotExists(literalId, {
//             label: `${predicate}: ${object.value}`,
//             color: 'gray',
//             size: 5,
//           });

//           // Connect literal node to subject
//           addEdgeIfNotExists(subjectId, literalId, { label: predicate });
//         }
//       });

//       // Instantiate Sigma.js only once
//       const container = document.getElementById('container');
//       if (!container.sigmaInstance) {
//         // Ensure Sigma instance is not recreated
//         container.sigmaInstance = new Sigma(graph, container);
//       }
//     }
//   });
// } catch (error) {
//   console.error('Error initializing Sigma.js:', error);
// }


// Assuming graphology and ForceAtlas2 are already included via CDN
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
  try {
    if (!graph.hasNode(id)) {
      // Add random x and y coordinates if not provided
      const x = Math.random() * 100; // Random value between 0 and 100
      const y = Math.random() * 100;
      graph.addNode(id, { x, y, size: 10, color: 'blue', label: id, ...attributes });
    }
  } catch (error) {
    console.error(`Error adding node '${id}':`, error);
  }
};

const addEdgeIfNotExists = (source, target, attributes = {}) => {
  try {
    if (!graph.hasEdge(source, target)) {
      graph.addEdge(source, target, attributes);
    }
  } catch (error) {
    console.error(`Error adding edge from '${source}' to '${target}':`, error);
  }
};

try {
  // Listen for the message event
  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'setRDFContent') {
      const { rdfContent } = message.content;
      console.log(rdfContent);

      try {
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
      } catch (rdfError) {
        console.error('Error processing RDF content:', rdfError);
      }

      // Apply graphologyLayoutForceAtlas2 layout to the graph
      try {
        const settings = {
          iterations: 100,
          settings: {
            barnesHutOptimize: true,
            barnesHutTheta: 0.5,
            gravity: 1,
            scalingRatio: 2,
          },
        };
        FA2Layout.assign(graph, settings);
        console.log('graphologyLayoutForceAtlas2 layout applied');
      } catch (layoutError) {
        console.error('Error applying graphologyLayoutForceAtlas2 layout:', layoutError);
      }

      // Instantiate Sigma.js only once
      try {
        const container = document.getElementById('container');
        if (!container.sigmaInstance) {
          container.sigmaInstance = new Sigma(graph, container);
        }
      } catch (sigmaError) {
        console.error('Error initializing Sigma.js:', sigmaError);
      }
    }
  });
} catch (error) {
  console.error('Unexpected error in event listener:', error);
}
