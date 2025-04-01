from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
from langchain_core.runnables import RunnableLambda, RunnableSequence
from extractor import extract_text_from_image

model = OllamaLLM(model="llama3.1:latest")

sysTemplate = "You will be given the data that has been extracted from the image of an invoice. The data is in full unstructured format, you need to parse the data and give a json object that contains each and every element extracted from the invoice."

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
# getResult = RunnableLambda(lambda x : x.content)

# chain = RunnableSequence(first = runnable1, middle = [runnable2, runnable3], last = runnable4)
chain = extractText | getPrompt | callModel

result = chain.invoke("C:/xampp/htdocs/invoiceParser/invoice.jpg")

print(result)