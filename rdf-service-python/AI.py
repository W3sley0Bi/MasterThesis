import subprocess

def ai_generation(text):
    prompt = f"""
    Generate {5} RDF instances for the class.
    The subject name must be a normal example name and not 'example'. 
    You must use prefixes.
    
    {text}
    
    Format the output in Turtle. Do not include any additional text.
    """

    result = subprocess.run(
        ["ollama", "run", "mistral", prompt],
        capture_output=True,
        text=True
    )

    print(result.stdout)
    print(result.stderr)




