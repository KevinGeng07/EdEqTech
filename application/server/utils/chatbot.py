import subprocess
import json

def get_response(prompt):
    result = subprocess.run(
        ["ollama", "run", "llama3.1"],
        input=prompt.encode(),
        stdout=subprocess.PIPE
    )
    return result.stdout.decode()

def chat_with_ai(request):
    queries = {k:v for k, v in request['searchParams'].items() if k != 'place_id' and k != 'k'}

    prompt = f'''
    You are a professional college counselor. You are currently counseling a prospective student that is searching for schools based on certain criterias.
    Currently, the student is looking into {request['schoolName']}
    The school received a similarity match score (range 0-1) of {request['similarity']}
    The following were the criterias: {queries}.
    Here is the chat history: {request['history']}
    
    This is the new user message: {request['message']}
    Only respond to what they ask. No prologues or epilogues. Under 100 words.
    Respond with a constructive review without excessive flattery on why this school received the similarity score:

    '''

    return get_response(prompt), prompt