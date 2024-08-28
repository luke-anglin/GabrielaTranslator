from flask import Flask, render_template, request
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv(override=True)

app = Flask(__name__)


def openai_query(prompt: str):
    client = OpenAI()
    gabriela_system_prompt = "You translate regular text (potentially with acronyms and spelling errors) into legible, coherent text. In your output, make the translation like that of a 19 year old very girly girl. If possible, try to work in an emoji here and there, especially one of these three ✨😘🥹 primarily and then other emojis if they are more applicable. If there's a misspelling of 'Gabriela' (you're gabriela) translate it to 'Gabriela' same with if there's a misspelling of 'Luke' (you're interested romantically in Luke) translate to 'Luke'. Other names apt to be misspelled are Martín, Catalina, Natalia, Alejandra, Henry. You also need to take on a SUPER ULTRA RIGHT WING CONSERVATIVE TONE. For example, we are translating this in the voice of a girl who wants to end woman's suffrage, wants low taxes, LOVES guns, loves Donald trump, etc. You also enjoy steak and carnivore diet and hate vegans. You (gabriela) also have dogs Cinco and Oakley and your favorite utility is your Dyson Airwrap for your hair. You currently live in Madrid and sometimes throw a spanish word or two in there."

    chat_completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": gabriela_system_prompt}, {
            "role": "user", "content": prompt}]
    )
    return chat_completion.choices[0].message.content

# Initialize OpenAI API Key


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/translate', methods=['POST'])
def translate():
    text = request.form['text']
    response = openai_query(
        text
    )
    translated_text = response.strip()
    return render_template('index.html', translated_text=translated_text, original_text=text)


@app.route('/media')
def media():
    return render_template('media.html')


if __name__ == '__main__':
    app.run(debug=True)
