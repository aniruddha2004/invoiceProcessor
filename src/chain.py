from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.messages import SystemMessage
import base64
from dotenv import load_dotenv
import os

load_dotenv()

def encode_image_to_base64(image_path):
    """Convert image to base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def clean_csv_output(text):
    """Clean the output by removing markdown code block markers and extra whitespace."""
    # Remove ```csv and ``` markers
    text = text.replace('```csv', '').replace('```', '')
    # Remove any leading/trailing whitespace
    text = text.strip()
    return text

def process_image(path):
    # Initialize the OpenAI model with GPT-4 Vision
    model = ChatOpenAI(
        model="gpt-4o",
        max_tokens=1000,
        temperature=0
    )

    # Create system message for context
    system_message = SystemMessage(
        content="""You are an expert at extracting structured data from invoice images.
        Your task is to extract information about items, their quantities, prices, and other details from the invoice image and return it in a CSV format.
        The first row should be headers, and subsequent rows should contain the corresponding values.
        **Focus on extracting each and every column and row, dont miss out on any columns and rows.
        Return ONLY the raw CSV data without any markdown formatting or code blocks.
        Do not include ```csv or ``` markers in your response."""
    )

    # Encode the image
    base64_image = encode_image_to_base64(path)

    # Create the human message with image
    human_message = HumanMessage(
        content=[
            {
                "type": "text",
                "text": "Extract the invoice data from this image and return it in CSV format. Do not include markdown formatting."
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}",
                    "detail": "high"
                }
            }
        ]
    )

    # Get the response from the model
    messages = [system_message, human_message]
    result = model.invoke(messages)
    
    # Clean the output before returning
    cleaned_result = clean_csv_output(result.content)
    print(cleaned_result)
    return cleaned_result

if __name__ == "__main__":
    # Test the function
    test_image = "path/to/test/image.jpg"
    if os.path.exists(test_image):
        result = process_image(test_image)
        print("Extracted CSV data:")
        print(result)