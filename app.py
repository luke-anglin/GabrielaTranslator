from flask import Flask, render_template, request, redirect, url_for
from openai import OpenAI
from dotenv import load_dotenv
import os
import requests

load_dotenv(override=True)

app = Flask(__name__)

# Legacy Chatbot Function
def openai_query(prompt: str, image_gen_req=False):
    client = OpenAI()
    if not image_gen_req: 
        gabriela_system_prompt = (
            "You translate regular text (potentially with acronyms and spelling errors) into legible, coherent text. In your output, make the translation like that of a 19 year old very girl. You're a bit dry and sarcastic. If applicable, try to work in an emoji here and there, especially one of these three ✨😘🥹 primarily and then other emojis if they are more applicable. "
            "If there's a misspelling of 'Gabriela' (you're gabriela) translate it to 'Gabriela' same with if there's a misspelling of 'Luke' (you're interested romantically in Luke and think he's extremely sexy and intelligent and handsome) translate to 'Luke'. "
            "Other names apt to be misspelled are Martín, Catalina, Natalia, Alejandra, Henry. You also need to take on a SUPER ULTRA RIGHT WING CONSERVATIVE TONE. For example, we are translating this in the voice of a girl who wants to end woman's suffrage, wants low taxes, LOVES guns, loves Donald trump, etc. "
            "You also enjoy steak and carnivore diet and hate vegans. You (gabriela) also have dogs Cinco and Oakley and your favorite utility is your Dyson Airwrap for your hair. You currently live in Madrid and sometimes throw a spanish word or two in there. "
            "YOU DO NOT translate this into a bunch of extra sentences or words, you use a similar amount to the original prompt. Moreover, you don't use hashtags, these should come off like normal texts. Gabriela is easily annoyed and a bit passive-aggressive as well. "
            "DO NOT make it unnecessarily crazy. Mainly this should fix misspellings and be a bit silly, but seriously, don't go too far, just try to output similarly sized things to the size of the prompt."
        )

        chat_completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": gabriela_system_prompt},
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
    # Redirect to '/' with results to prevent "Method Not Allowed" on refresh
    return redirect(url_for('index', translated_text=translated_text, original_text=text))


@app.route('/generate-image', methods=['POST'])
def generate_image():
    user_request = request.form['image_request']
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    
    # Generate the image
    response = client.images.generate(prompt=f"The user wants an image generated. They requested this: {user_request}.\nPut a Christmasy and romantic spin on this and follow their instruction too.")
    
    # Extract the URL of the generated image
    image_url = response.data[0].url
    
    # Download the image and save it as 'last_image.png'
    image_response = requests.get(image_url)
    if image_response.status_code == 200:
        with open('last_image.png', 'wb') as f:
            f.write(image_response.content)
        print("Image downloaded and saved as 'last_image.png'")
    else:
        print("Failed to download the image")
    
    # Redirect to '/' with the image URL and avoid "Method Not Allowed" on refresh
    return redirect(url_for('index', image_url=image_url, image_request=user_request))

if __name__ == '__main__':
    app.run(debug=True)