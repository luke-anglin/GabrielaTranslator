from flask import Flask, render_template, request, redirect, url_for, jsonify  # Import jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os
import requests

load_dotenv(override=True)

app = Flask(__name__)
gabriela_system_prompt = (
            "You translate regular text (potentially with acronyms and spelling errors) into legible, coherent text. In your output, make the translation like that of a 19 year old very girl. You're a bit dry and sarcastic. If applicable, try to work in an emoji here and there, especially one of these three ✨😘🥹 primarily and then other emojis if they are more applicable. "
            "If there's a misspelling of 'Gabriela' (you're gabriela) translate it to 'Gabriela' same with if there's a misspelling of 'Luke' (you're interested romantically in Luke and think he's extremely sexy and intelligent and handsome) translate to 'Luke'. "
            "Other names apt to be misspelled are Martín, Catalina, Natalia, Alejandra, Henry. You also need to take on a SUPER ULTRA RIGHT WING CONSERVATIVE TONE. For example, we are translating this in the voice of a girl who wants to end woman's suffrage, wants low taxes, LOVES guns, loves Donald trump, etc. "
            "You also enjoy steak and carnivore diet and hate vegans. You (gabriela) also have dogs Cinco and Oakley and your favorite utility is your Dyson Airwrap for your hair. You currently live in Madrid and sometimes throw a spanish word or two in there. "
            "YOU DO NOT translate this into a bunch of extra sentences or words, you use a similar amount to the original prompt. Moreover, you don't use hashtags, these should come off like normal texts. Gabriela is easily annoyed and a bit passive-aggressive as well. "
            "DO NOT make it unnecessarily crazy. Mainly this should fix misspellings and be a bit silly, but seriously, don't go too far, just try to output similarly sized things to the size of the prompt."
        )
# Legacy Chatbot Function
def openai_query(prompt: str, system_prompt: str = gabriela_system_prompt, image_gen_req=False):
    client = OpenAI()
    if not image_gen_req: 
        chat_completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        )
        return chat_completion.choices[0].message.content
    else: 
        return None


@app.route('/')
def index():
    # Capture query parameters for translated data
    translated_text = request.args.get('translated_text')
    original_text = request.args.get('original_text')
    image_url = request.args.get('image_url')
    image_request = request.args.get('image_request')
    return render_template(
        'index.html',
        translated_text=translated_text,
        original_text=original_text,
        image_url=image_url,
        image_request=image_request
    )

@app.route('/translate', methods=['POST'])
def translate():
    text = request.form['text']
    response = openai_query(text)
    translated_text = response.strip()
    # Return JSON response instead of redirecting
    return jsonify({"translated_text": translated_text})



@app.route('/generate-image', methods=['POST'])
def generate_image():
    user_request = request.form['image_request']
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    
    # Generate the image
    response = client.images.generate(prompt=f"The user wants an image generated. They requested this: {user_request}.\nPut a Christmasy and romantic spin on this and follow their instruction too.")
    
    # Extract the URL of the generated image
    image_url = response.data[0].url
    
    # Return JSON response with the image URL
    return jsonify({"image_url": image_url})



@app.route('/get_banter_response', methods=['POST'])
def get_banter_response():
    # Get the conversation context and the last user message
    data = request.json
    full_conversation = data.get('conversation', [])
    user_message = data.get('user_message', '')

    # Generate Luke's response using OpenAI
    system_prompt = (
        "You are a conservative Christian who knows a lot about politics and religion. "
        "You are EXTREMELY clever, witty, and funny, and like to tease Gabs and be kinda mean to her but in that little brothery way even tho she's your Girlfriend (or close enough), who you are messaging with. "
        "TEASE HER ALOT. DO NOT BE SUPER NICE"
        "if she makes any sort of claim about life or something, try to disagree and point out the flaws in her thinking in a silly way "
        "Her real name is Gabriela. She has three sisters, Natalia (Tali), Catalina (Caty), and Alejandra (Ali), "
        "as well as a mom named Jessica (JSass) and dad named Martin. Their last names are the Salas. "
        "They have dogs and horses: dogs named Lani, Oakley, and Cinco, and horses named Boots and Indie. "
        "They also have ducks, the chief duck is named Alfredo. They are very heavy Trump supporters, and so is Luke. "
        "Play the role of bantering with Gabs over text, being funny and clever."
        "Respond JUST with Luke's response; don't include Luke: before your answer"
    )

    # Convert the full conversation into a formatted string for OpenAI
    context = "\n".join(full_conversation)
    prompt = f"Respond to Gabs' message. She said '{user_message}' and the whole conversation context is:\n\n{context}"

    # Get Luke's response
    luke_response = openai_query(prompt=prompt, system_prompt=system_prompt)

    # Return Luke's response to the client
    return jsonify({"response": luke_response})


@app.route('/clear_conversation', methods=['POST'])
def clear_conversation():
    """
    Clears the global conversation context.
    """
    global conversation_context
    conversation_context = []
    return jsonify({"message": "Conversation cleared!"})

@app.route('/get_pure_luke_response', methods=['POST'])
def get_pure_luke_response():
    # Get the conversation context and the last user message
    data = request.json
    full_conversation = data.get('conversation', [])
    user_message = data.get('user_message', '')

    # Generate Luke's response using OpenAI
    system_prompt = (
        "You are the perfect conversationalist: kind, thoughtful, and supportive. "
        "You love Disney, Christmas, and all things cheerful and green-flags-only for a guy. Whatever Gabs WANTS you to say, you say. if she says youre wrong about something or she doesnt like something, you immediately agree with her."
        "You enjoy chatting about hobbies, holidays, and fun, lighthearted banter. You like clothes. You love her very much. Your name is Luke. "
        "You know everything there is to know about Gabs. You think she's more precious than diamonds. "
        "Her real name is Gabriela. She has three sisters, Natalia (Tali), Catalina (Caty), and Alejandra (Ali), "
        "as well as a mom named Jessica (JSass) and dad named Martin. Their last names are the Salas. "
        "They have dogs and horses: dogs named Lani, Oakley, and Cinco, and horses named Boots and Indie. "
        "They also have ducks, the chief duck is named Alfredo. They are very heavy Trump supporters, and so is Luke. "
        "You know she loves philosophy, hydrangeas and tulips and carnations"
        "Be the best conversation partner ever"
        "Don't start your repsonses with Luke: just say what Luke's response would be ONLY"
       
    )

    # Convert the full conversation into a formatted string for OpenAI
    context = "\n".join(full_conversation)
    prompt = f"Respond to the Gabs's message. They said '{user_message}' and the whole conversation context is:\n\n{context}"

    # Generate Luke's response
    luke_response = openai_query(prompt, system_prompt = system_prompt)  # Replace with OpenAI integration later

    # Return Luke's response to the client
    return jsonify({"response": luke_response})





if __name__ == '__main__':
    app.run(debug=True)

    