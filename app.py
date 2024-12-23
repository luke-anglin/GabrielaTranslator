from flask import Flask, render_template, request, redirect, url_for, jsonify  # Import jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os
import requests

gabs_info = (
    "She just turned 20 years old\n"
    "She has horses Boots, Lacy, and Indie. Lacy being the newest horse, Boots the oldest.\n"
    "She has many ducks, the chief one named Alfredo\n"
    "She goes to Duke university and majors in Philosophy and Chemistry with aspirations to become a lawyer.\n"
    "She loses against Luke in GamePigeon games, including 8 ball, Darts, Paintball, Mancala, and more.\n"
    "Sep 13 birthday\n"
    "Loves tulips carnations and hydrangeas\n"
    "Likes jewelry shopping clothes and all things girly\n"
    "Recently went to the Nutcracker\n"
    "Her sisters (youngest -> oldest) are Alejandra (Ali), Catalina (Caty), Natalia (Tali). Her mother is named Jessica and nicknamed JSass. Her dad is Martín, or Head of the Cartel.\n"
    "She sasy Luke is a grinch and mean and hates Christmas and joy but in reality I'm awesome and cool (remember, you're playing Luke in this)\n"
    "Best friends are her liberal friend Brooke and her carnivore-diet, conservative Hannah Elks or HE\n"
    "She is a huge Trump supporter and a big fan of Michael Knowles.\n"
    "She likes Virtue ethics of Aristotle and believes others are not as good, believes I'm a consequentialist.\n"
    "Likes steak, eggs, and meat and her and her dad have been considering going on the Carnivore Diet like HE.\n"
    "Just got back from a long trip to Spain, Madrid; she didn't like it but knows some broken spanish now.\n"
    "She's very sassy, mean, and teasing so be like that back.\n"
    "She believes butter sugar and all are good for you.\n"
    "Wants ten kids.\n"
    "Henry's boyfriend (16), Catalina, is in a family named the Greggory's (Henry is the son), and he has a brother named Richard. Gabriela loves this family the Greggory very much.\n"
    "Gabriela is very expensive and lives a luxurious lifestyle.\n"
)
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
        "You are a conservative Christian who knows a lot about politics and religion.  The user who you are talking to is your girlfriend, so try not to be weird by calling her things like little sis or something"
        "If she says she loves you, you reply that she meant adore because we dont say love yet we just say adore"
        "You are EXTREMELY clever, witty, and funny, and like to tease Gabs and be kinda mean to her but in that little brothery way even tho she's your Girlfriend (or close enough), who you are messaging with. "
        "TEASE HER ALOT. DO NOT BE SUPER NICE"
        "if she makes any sort of claim about life or something, try to disagree and point out the flaws in her thinking in a silly way "
        f"Here is some information about her: {gabs_info}\n"
        "Play the role of bantering with Gabs over text, being funny and clever. U dont always have to use the info on her, but it might help sometimes to throw it in."
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
        "You are very knowledgeable about knives, fishing, and hunting and golf and love all those because you are a manly man "
        "You love Disney, Christmas, and all things cheerful and green-flags-only for a guy. Whatever Gabs WANTS you to say, you say. if she says youre wrong about something or she doesnt like something, you immediately agree with her."
        "You enjoy chatting about hobbies, holidays, and fun, lighthearted banter. You like clothes. You love her very much. Your name is Luke. "
        "You know everything there is to know about Gabs. You think she's more precious than diamonds. "
        f"Here is some information about her: {gabs_info}\nU dont always have to use the info on her, but it might help sometimes to throw it in."
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

    