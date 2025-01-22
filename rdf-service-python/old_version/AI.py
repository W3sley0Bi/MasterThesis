from ollama import chat
from ollama import ChatResponse

def ai_generation(text):
    prompt = f"""
    List 50 entities that are types of {text}

    """

    response: ChatResponse = chat(model='llama3.2', messages=[
    {
        'role': 'user',
        'content': f'{prompt}',
    },
    ])
    print(response['message']['content'])
    # # or access fields directly from the response object
    # print(response.message.content)




