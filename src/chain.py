from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnableLambda
from extractor import extract_text_from_image
from dotenv import load_dotenv
import os

load_dotenv()

def process_image(path) :
    model = ChatGroq(temperature=0, model_name="llama-3.3-70b-versatile")

    sysTemplate = os.getenv("SYSTEM_PROMPT")

    promptTemplate = ChatPromptTemplate.from_messages([
        ("system", sysTemplate),
        ("human", "Here is the extracted text : '{text}'")
    ])

    def getText(x) :
        text = extract_text_from_image(x)
        print(text)
        return { "text" : text}


    extractText = RunnableLambda(getText)
    getPrompt = RunnableLambda(lambda x : promptTemplate.invoke(x))
    callModel = RunnableLambda(lambda x : model.invoke(x))
    getResult = RunnableLambda(lambda x : x.content)

    chain = extractText | getPrompt | callModel | getResult

    result = chain.invoke(path)

    return result

# print(process_image("C:/xampp/htdocs/parser-invoice/src/invoice2.jpg"))