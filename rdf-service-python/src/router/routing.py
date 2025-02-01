from typing import Union
import json
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import HTMLResponse

from ..modules.instance_generation.instance_generation_main import instance_generation_main


router = APIRouter()



@router.get("/", response_class=HTMLResponse)
async def upload_file():
    with open("src/ui/index.html", "r", encoding="utf-8") as file:
        content = file.read()
        
        # TODO: use the commended code fore vs code since you are not doing a file upload in a normal way but in the IDE
    # rdfs = instance_generation_main("test.ttl")
    # jsondl_string = rdfs["json_dl"].replace('"', '&quot;')
    # content = content.replace('jsonData=""', f'jsonData="{jsondl_string}"')
    return HTMLResponse(content)



# main endpoint for the instance generation
# the support instances have no properties
# everything must be declared in the turtle file TODO: add this check. if something is not specifically declared in the turtle file it will not be generated

@router.post("/generate", tags=["users"])
async def scan_file(file: UploadFile = File(...), n: int = 2, property_search: bool = False, ):
    return instance_generation_main(file.file, n, property_search)





#         # 
# TESTING #         
#         # 


@router.get("/generate/test", tags=["users"])
async def scan_file(n: int = 2, property_search: bool = False):
    print(n, property_search)
    return instance_generation_main("test.ttl")