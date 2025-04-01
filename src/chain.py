from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnableLambda
from extractor import extract_text_from_image
from dotenv import load_dotenv

load_dotenv()

def process_image(path) :
    model = ChatGroq(temperature=0, model_name="llama-3.3-70b-versatile")

    sysTemplate = "You will be given the data that has been extracted from the image of an invoice. The data is in full unstructured format, you need to parse the data and give a json object that contains each and every element extracted from the invoice. The response should only contain the json object, not even a single extra text should be present."

    promptTemplate = ChatPromptTemplate.from_messages([
        ("system", sysTemplate),
    ("human", "Here is the extracted text : '{text}'")
    ])

    def getText(x) :
        text = extract_text_from_image(x)
        return { "text" : text}


    extractText = RunnableLambda(getText)
    getPrompt = RunnableLambda(lambda x : promptTemplate.invoke(x))
    callModel = RunnableLambda(lambda x : model.invoke(x))
    getResult = RunnableLambda(lambda x : x.content)

    chain = extractText | getPrompt | callModel | getResult

    result = chain.invoke(path)

    return result

# print(process_image("C:/xampp/htdocs/parser-invoice/src/invoice2.jpg"))