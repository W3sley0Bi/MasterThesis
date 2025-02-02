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
            </style>`;
    
        const webviewContent = `<h2>Visualize a Turtle File (.ttl)</h2>`;
    
        const standardContent = `
            <h2>Upload & Visualize a Turtle File (.ttl)</h2>
            <input type="file" id="fileInput" accept=".ttl">
            <br>
            <button id="uploadBtn">Upload & Visualize</button>
            <h3>Raw Turtle RDF:</h3>
            <div id="response">No response yet.</div>
        `;
    
        this.shadowRoot.innerHTML = sharedStyles + (isVSCodeWebView ? webviewContent : standardContent);
    }
    

    
    connectedCallback() {
        this.shadowRoot.getElementById('uploadBtn').addEventListener('click', () => this.uploadFile());
    }

    async uploadFile() {
        const fileInput = this.shadowRoot.getElementById("fileInput");
        const responseDiv = this.shadowRoot.getElementById("response");
        const rdfVisualizer = document.getElementById("rdfVisualizer");
        
        if (fileInput.files.length === 0) {
            responseDiv.innerHTML = "Please select a .ttl file.";
            return;
        }

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {

            // fire and forget
            const response = await fetch("http://localhost:8000/generate?n=1", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            let res = await response.json();
            let ttlText = res.turtle;
            let jsonData = res.json_dl; // The data needed for visualization
            
            responseDiv.innerText = ttlText;

            const blob = new Blob([ttlText], { type: "text/turtle" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "generated.ttl";
            a.innerText = "Download generated.ttl";
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
