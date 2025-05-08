// --- Helper Functions (independent of the DOM) ---

function generatePrefixMapping(jsonData) {
  const uriSet = new Set();
  function scan(item) {
    if (typeof item === 'string') {
      if (item.startsWith("http://") || item.startsWith("https://")) {
        uriSet.add(item);
      }
    } else if (Array.isArray(item)) {
      item.forEach(scan);
    } else if (typeof item === 'object' && item !== null) {
      for (let key in item) {
        scan(item[key]);
      }
    }
  }
  jsonData.forEach(scan);

  function getBase(uri) {
    if (uri.includes("#")) {
      return uri.substring(0, uri.lastIndexOf("#") + 1);
    } else {
      const lastSlash = uri.lastIndexOf("/");
      return lastSlash !== -1 ? uri.substring(0, lastSlash + 1) : uri;
    }
  }

  const baseSet = new Set();
  uriSet.forEach(uri => {
    baseSet.add(getBase(uri));
  });

  const prefixMapping = {};
  let count = 1;
  baseSet.forEach(base => {
    prefixMapping[base] = "p" + count;
    count++;
  });
  return prefixMapping;
}

function shorten(uri, dynamicPrefixes) {
  for (const base in dynamicPrefixes) {
    if (uri.startsWith(base)) {
      return dynamicPrefixes[base] + ":" + uri.slice(base.length);
    }
  }
  return uri;
}

function generateLegendHTML(prefixMapping) {
  let html = "<h3>Legend</h3>";
  html += "<table><tr><th>Prefix</th><th>URI</th></tr>";
  for (const base in prefixMapping) {
    html += "<tr><td>" + prefixMapping[base] + "</td><td>" + base + "</td></tr>";
  }
  html += "</table>";
  html += "<p><strong>Node Types:</strong></p><ul>";
  html += '<li><span style="color: #FFA500; font-weight: bold;">Class</span>: Box (orange)</li>';
  html += '<li><span style="color: #ADFF2F; font-weight: bold;">Property</span>: Diamond (green-yellow)</li>';
  html += '<li><span style="color: #97C2FC; font-weight: bold;">Instance</span>: Dot (blue)</li>';
  html += '<li><span style="color: #FFD700; font-weight: bold;">Literal</span>: Box (yellow)</li>';
  html += "</ul>";
  return html;
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#','');
  if(hex.length === 3) {
    hex = hex.split('').map(h => h + h).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function processJsonLd(data, dynamicPrefixes) {
  const nodesMap = {};
  const edges = [];
  let literalCounter = 0;
  
  data.forEach(item => {
    const subjectId = item['@id'];
    let nodeType = 'instance';
    if (item['@type']) {
      const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
      if (types.includes("http://www.w3.org/2000/01/rdf-schema#Class")) {
        nodeType = 'class';
      } else if (types.includes("http://www.w3.org/1999/02/22-rdf-syntax-ns#Property")) {
        nodeType = 'property';
      }
    }
    if (!nodesMap[subjectId]) {
      let label = subjectId;
      if (item["http://www.w3.org/2000/01/rdf-schema#label"]) {
        label = item["http://www.w3.org/2000/01/rdf-schema#label"][0]["@value"] || subjectId;
      } else {
        label = shorten(subjectId, dynamicPrefixes);
      }
      let shape = 'dot';
      let color = '#97C2FC'; // blue for instances
      if (nodeType === 'class') {
        shape = 'box';
        color = '#FFA500';
      } else if (nodeType === 'property') {
        shape = 'diamond';
        color = '#ADFF2F';
      }
      nodesMap[subjectId] = { 
        id: subjectId, 
        label: label, 
        shape: shape, 
        color: color,
        baseColor: color, 
        nodeType: nodeType,
        font: { color: "#000000", baseColor: "#000000" }
      };
    }
    if (item['@type']) {
      const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
      types.forEach(t => {
        let typeId = (typeof t === 'string') ? t : (t['@id'] || null);
        if (typeId) {
          if (!nodesMap[typeId]) {
            nodesMap[typeId] = {
              id: typeId,
              label: shorten(typeId, dynamicPrefixes),
              shape: 'box',
              color: '#FFA500',
              baseColor: '#FFA500',
              nodeType: 'class',
              font: { color: "#000000", baseColor: "#000000" }
            };
          }
          edges.push({
            from: subjectId,
            to: typeId,
            label: shorten("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", dynamicPrefixes),
            dashes: true,
            color: { color: '#000000' },
            font: { color: '#000000', baseColor: '#000000' }
          });
        }
      });
    }
    Object.keys(item).forEach(prop => {
      if (prop === '@id' || prop === '@type') return;
      const values = item[prop];
      if (Array.isArray(values)) {
        values.forEach(val => {
          if (val && typeof val === 'object') {
            if (val['@id']) {
              const targetId = val['@id'];
              if (!nodesMap[targetId]) {
                nodesMap[targetId] = {
                  id: targetId,
                  label: shorten(targetId, dynamicPrefixes),
                  shape: 'dot',
                  color: '#97C2FC',
                  baseColor: '#97C2FC',
                  nodeType: 'instance',
                  font: { color: "#000000", baseColor: "#000000" }
                };
              }
              edges.push({
                from: subjectId,
                to: targetId,
                label: shorten(prop, dynamicPrefixes),
                arrows: 'to',
                color: { color: '#000000' },
                font: { color: '#000000', baseColor: '#000000' }
              });
            } else if (val['@value']) {
              const literalValue = String(val['@value']);
              const literalId = `literal_${literalCounter++}`;
              nodesMap[literalId] = {
                id: literalId,
                label: literalValue,
                shape: 'box',
                color: '#FFD700',
                baseColor: '#FFD700',
                nodeType: 'literal',
                font: { color: "#000000", baseColor: "#000000" }
              };
              edges.push({
                from: subjectId,
                to: literalId,
                label: shorten(prop, dynamicPrefixes),
                arrows: 'to',
                color: { color: '#000000' },
                font: { color: '#000000', baseColor: '#000000' }
              });
            }
          }
        });
      }
    });
  });
  return { nodes: Object.values(nodesMap), edges: edges };
}

// --- Web Component Definition ---

class RDFVisualizer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Set up the component's template.
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/visualizer/style.css">
      <div id="network-container">
        <div id="mynetwork"   style="height: 100vh;"></div>
      </div>
    `;

    // Process the jsondata attribute if it exists.
    if (this.hasAttribute('jsondata')) {
      const jsonDataAttr = this.getAttribute('jsondata');
      try {
        // Parse the JSON string if necessary.
        // Ensure that the data is an array if your code expects an array.
        let parsedData = typeof jsonDataAttr === 'string' ? JSON.parse(jsonDataAttr) : jsonDataAttr;
        if (!Array.isArray(parsedData)) {
          console.warn("Parsed JSON data is not an array. Wrapping it in an array.");
          parsedData = [parsedData];
        }
        this._jsonData = parsedData;
      } catch (error) {
        console.error("Error parsing jsondata attribute in connectedCallback:", error);
        this._jsonData = [];
      }
    } else {
      this._jsonData = [];
    }

    // Initialize visualization with the (possibly parsed) JSON data.
    this.initialize();
  }

  // Optionally support dynamic updates to the jsondata attribute.
  static get observedAttributes() {
    return ['jsondata'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'jsondata') {
      try {
        // Reuse the setter to parse (if needed) and assign the value.
        this.jsonData = newValue;
      } catch (error) {
        console.error("Error processing jsondata attribute change:", error);
      }
    }
  }

  set jsonData(value) {
    // If the value is a JSON string, parse it first.
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (error) {
        console.error("Error parsing JSON in setter:", error);
        value = [];
      }
    }
    // Ensure the data is an array.
    if (!Array.isArray(value)) {
      console.warn("jsonData is not an array. Wrapping it in an array.");
      value = [value];
    }
    this._jsonData = value;
    this.initialize();
  }

  get jsonData() {
    return this._jsonData;
  }

  initialize() {
    if (!this._jsonData || !Array.isArray(this._jsonData) || this._jsonData.length === 0) {
      console.warn("No valid JSON data available for visualization.");
      return;
    }



    const jsonDataLocal = this._jsonData;

    // Use our JSON-LD data.
    // const jsonDataLocal = jsonData; // our global jsonData
    // Generate dynamic prefixes.
    const dynamicPrefixesLocal = generatePrefixMapping(jsonDataLocal);
    // Set legend HTML.
    // const legendEl = this.shadowRoot.querySelector("#legend");
    // legendEl.innerHTML = generateLegendHTML(dynamicPrefixesLocal);

    // Process JSON-LD into graph data.
    const graphData = processJsonLd(jsonDataLocal, dynamicPrefixesLocal);
    const nodes = new vis.DataSet(graphData.nodes);
    const edges = new vis.DataSet(graphData.edges);
    const dataForNetwork = { nodes: nodes, edges: edges };

    // Define network options.
    const options = {
      layout: { improvedLayout: true },
      physics: {
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.2,
          springLength: 200,
          springConstant: 0.04,
          damping: 0.09
        },
        stabilization: {
          iterations: 2500,
          updateInterval: 25,
          fit: true
        },
        minVelocity: 0.75
      },
      edges: {
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'vertical',
          roundness: 0.4
        }
      },
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true
      }
    };

    // Create the network.
    const container = this.shadowRoot.querySelector("#mynetwork");
    const network = new vis.Network(container, dataForNetwork, options);

    network.once('stabilizationIterationsDone', function () {
      network.setOptions({ physics: false });

      //performance test
      requestAnimationFrame(() => {
        const end = performance.now();
        const renderTime = end - window.renderStartTime;
        console.log(`Render completed in ${renderTime.toFixed(2)} ms`);
      });
    });

    // Highlighting behavior.
    network.on("click", function(params) {
      if (params.nodes.length === 0) {
        // Restore full opacity.
        nodes.getIds().forEach(nodeId => {
          let node = nodes.get(nodeId);
          nodes.update({ 
            id: nodeId, 
            color: node.baseColor, 
            font: { color: node.font.baseColor || node.font.color, baseColor: node.font.baseColor || node.font.color }
          });
        });
        edges.getIds().forEach(edgeId => {
          let edge = edges.get(edgeId);
          edges.update({ 
            id: edgeId, 
            color: { color: '#000000' },
            font: { color: edge.font.baseColor || edge.font.color, baseColor: edge.font.baseColor || edge.font.color }
          });
        });
      } else {
        const clickedNodeId = params.nodes[0];
        const neighborNodeIds = network.getConnectedNodes(clickedNodeId);
        const highlighted = new Set([clickedNodeId, ...neighborNodeIds]);
        nodes.getIds().forEach(nodeId => {
          let node = nodes.get(nodeId);
          if (highlighted.has(nodeId)) {
            nodes.update({ 
              id: nodeId, 
              color: node.baseColor,
              font: { color: node.font.baseColor || node.font.color, baseColor: node.font.baseColor || node.font.color }
            });
          } else {
            nodes.update({ 
              id: nodeId, 
              color: hexToRgba(node.baseColor, 0.05),
              font: { color: hexToRgba(node.font.baseColor || node.font.color, 0.05), baseColor: node.font.baseColor || node.font.color }
            });
          }
        });
        edges.getIds().forEach(edgeId => {
          let edge = edges.get(edgeId);
          if (highlighted.has(edge.from) && highlighted.has(edge.to)) {
            edges.update({ 
              id: edgeId, 
              color: { color: '#000000' },
              font: { color: edge.font.baseColor || edge.font.color, baseColor: edge.font.baseColor || edge.font.color }
            });
          } else {
            edges.update({ 
              id: edgeId, 
              color: { color: 'rgba(0,0,0,0.05)' },
              font: { color: 'rgba(0,0,0,0.05)', baseColor: edge.font.baseColor || edge.font.color }
            });
          }
        });
      }
    });


    // Toggle legend functionality.
    // this.shadowRoot.querySelector("#toggleLegend").addEventListener("click", () => {
    //   const legend = this.shadowRoot.querySelector("#legend");
    //   if (legend.style.display === "none" || legend.style.display === "") {
    //     legend.style.display = "block";
    //     this.shadowRoot.querySelector("#toggleLegend").textContent = "Hide Legend";
    //   } else {
    //     legend.style.display = "none";
    //     this.shadowRoot.querySelector("#toggleLegend").textContent = "Show Legend";
    //   }
    // });
  }
}

customElements.define("rdf-visualizer", RDFVisualizer);
