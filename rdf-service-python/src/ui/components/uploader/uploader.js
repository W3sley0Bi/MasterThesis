class TurtleFileUploader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    
        const isVSCodeWebView = typeof acquireVsCodeApi === "function";
    
        const sharedStyles = `
            <style>
                :host {
                    font-family: Arial, sans-serif;
                    display: block;
                    text-align: center;
                }
                input, button {
                    margin-top: 10px;
                    padding: 8px;
                }
                #response {
                    margin-top: 20px;
                    padding: 10px;
                    border: 1px solid #ddd;
                    background-color: #f9f9f9;
                    white-space: pre-wrap;
                    text-align: left;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                    height: 300px;
                    overflow-y: auto;
                }

                /* From Uiverse.io by Fernando-sv */ 
                .loader {
                border: 4px solid rgba(0, 0, 0, .1);
                border-left-color: transparent;
                border-radius: 50%;
                }

                .loader {
                border: 4px solid rgba(0, 0, 0, .1);
                border-left-color: transparent;
                width: 6px;
                height: 6px;
                }

                .loader {
                border: 4px solid rgba(0, 0, 0, .1);
                border-left-color: transparent;
                width: 6px;
                height: 6px;
                animation: spin89345 1s linear infinite;
                }

                @keyframes spin89345 {
                0% {
                    transform: rotate(0deg);
                }

                100% {
                    transform: rotate(360deg);
                }
                }
            </style>`;
    
        const webviewContent = `<h2>Visualize a RDF file</h2>`;

    
        const standardContent = `
            <h2>Upload & Visualize a RDF File </h2>
            <input type="file" id="fileInput" accept=".ttl, .rdf, .xml, .n3, .jsonld, .nt">
            <br>
            <button id="VisualizeBtn">Visualize</button>
            <input type="number" id="n" placeholder="Number of instances to generate" value="3" max="10" min="1" width="50px" onKeyDown="return event.key === 'ArrowUp' || event.key === 'ArrowDown'">
            <button id="uploadBtn">Generate & Visualize</button>
            <button id="searchBtn">Generate with property search & Visualize</button>
            <button id="AIBtn" disabled>Generate with AI & Visualize</button>

    
            <h3>Raw Turtle RDF:</h3>
            <div id="response">No response yet.</div>

            <button id="downloadGraph" >download Graph</button>
        `;
    
        this.shadowRoot.innerHTML = sharedStyles + (isVSCodeWebView ? webviewContent : standardContent);
    }
    
    
    connectedCallback() {
        let visualizeBtn = this.shadowRoot.getElementById('VisualizeBtn');
        let generateBtn = this.shadowRoot.getElementById('uploadBtn')
        let searchBtn = this.shadowRoot.getElementById('searchBtn')
        let downloadBtn = this.shadowRoot.getElementById('downloadGraph')

        visualizeBtn.addEventListener('click', () => this.uploadFile(true));
        generateBtn.addEventListener('click', () => this.uploadFile());
        searchBtn.addEventListener('click', async () => {
        let text = searchBtn.innerHTML
        searchBtn.innerHTML = '<div class="loader"></div>'
            await this.uploadFile(false,true)
        searchBtn.innerHTML = text
        });

        downloadBtn.addEventListener('click', () => {
            function findCanvasElement() {
                const elements = document.querySelectorAll("*");
                for (const el of elements) {
                    if (el.shadowRoot) {
                        const canvas = el.shadowRoot.querySelector("canvas");
                        if (canvas) return canvas;
                    }
                }
                return null;
            }
        
            const canvas = findCanvasElement();
            if (!canvas) {
                alert("Graph not found please upload a file");;
                console.error("Canvas not found");
                return;
            }
        
 
            const imgData = canvas.toDataURL("image/png");
        

            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'canvas.png'; 
        
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        
    }

    async uploadFile(edit = false, search = false) {
        const fileInput = this.shadowRoot.getElementById("fileInput");
        const responseDiv = this.shadowRoot.getElementById("response");
        const rdfVisualizer = document.getElementById("rdfVisualizer");
        const n = this.shadowRoot.getElementById("n").value;

        if (fileInput.files.length === 0) {
            responseDiv.innerHTML = "Please select RDF file.";
            return;
        }

        // if(search && n > 3) {
        //     responseDiv.innerHTML = "Please reduce the number of instances. The MAX number of this feature is 3.";
        //     return;
        // }

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {

            // fire and forget
            
            const response = await fetch(`/generate?n=${n}&edit=${edit}&property_search=${search}`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            window.renderStartTime = performance.now();
            console.log(window.renderStartTime)

            let res = await response.json();
            let data = res.data;
            let jsonData = res.json_dl; // The data needed for visualization
            let fileName = res.fileName

        
            responseDiv.innerText = data;

            const blob = new Blob([data]);
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = res.fileName;
            a.innerText = `Download ${fileName}`;
            a.style.display = "block";
            a.style.marginTop = "10px";

            responseDiv.appendChild(a);

            rdfVisualizer.setAttribute("jsondata", jsonData);
            
            console.log(rdfVisualizer)

        } catch (error) {
            responseDiv.innerHTML = "Error: " + error.message;
            console.error("Error:", error);
        }
    }
}

customElements.define('turtle-file-uploader', TurtleFileUploader);
