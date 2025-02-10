from typing import Union
import json
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse
from ..modules.validation.validator import is_valid_rdf
from ..modules.instance_generation.instance_generation_main import instance_generation_main, just_view_graph


router = APIRouter()



@router.get("/", response_class=HTMLResponse)
async def upload_file():
    with open("src/ui/index.html", "r", encoding="utf-8") as file:
        content = file.read()
        
    #     # TODO: use the commended code fore vs code since you are not doing a file upload in a normal way but in the IDE
    # rdfs = await instance_generation_main("test.ttl") # leave test.tll  so that the user cna se some default values
    # jsondl_string = rdfs["json_dl"].replace('"', '&quot;')
    # content = content.replace('jsonData=""', f'jsonData="{jsondl_string}"')
    return HTMLResponse(content)



@router.post("/generate", tags=["users"])
async def scan_file(file: UploadFile = File(...), n: int = 2, property_search: bool = False, edit: bool = False):
    isValid = await is_valid_rdf(file)
    if isValid: 
        if edit: return await just_view_graph(file)
        return await instance_generation_main(file, n, property_search)
    else: return {"turtle": "File is invalid, please upload one of the following formats: RDF/XML → .rdf or .xml; N3 (Notation3) → .n3; N-Triples → .nt; N-Quads → .nq; Turtle → .ttl; TriX (RDF Triples in XML) → .trix; JSON-LD → .jsonld; HexTuples → .hext"}


# -------------------------- FOR EXTENSION ------------------------------------


@router.post("/", response_class=HTMLResponse | JSONResponse)
async def upload_file(fileUpload: UploadFile = File(...), n: int = 2, property_search: bool = False, edit: bool = False):

    isValid = await is_valid_rdf(fileUpload)
    if isValid: 
        with open("src/ui/index.html", "r", encoding="utf-8") as file:
            readFile = file.read()   
        if edit:
            rdfs = await just_view_graph(fileUpload)
        else:
            rdfs = await instance_generation_main(fileUpload, n, property_search)
        rdfData = rdfs["data"]
        jsondl_string = rdfs["json_dl"].replace('"', '&quot;')
        updatedFile = readFile.replace('jsonData=""', f'jsonData="{jsondl_string}"')
        return JSONResponse(content={"content": f"{updatedFile}",
                                  "rdfData" : f"{rdfData}"
                                  }, status_code=200)
    else: 
        return JSONResponse(
            content={
                "ERROR": "File is invalid, please upload one of the following formats: RDF/XML → .rdf or .xml; "
                        "N3 (Notation3) → .n3; N-Triples → .nt; N-Quads → .nq; Turtle → .ttl; "
                        "TriX (RDF Triples in XML) → .trix; JSON-LD → .jsonld; HexTuples → .hext"
            },
            status_code=400
    )
#         # 
# TESTING #         
#         # 