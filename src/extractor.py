import os
import pytesseract
from PIL import Image, ImageFilter

def preprocess_image_pil(image_path):
    image = Image.open(image_path)
    # Convert to grayscale
    gray = image.convert('L')
    # Increase contrast by applying a binary threshold
    binary = gray.point(lambda x: 255 if x > 128 else 0, '1')
    # Optionally, you can sharpen the image
    enhanced = binary.filter(ImageFilter.SHARPEN)
    return enhanced

def extract_text_from_image(image_path):
    try:
        processed_image = preprocess_image_pil(image_path)
        text = pytesseract.image_to_string(processed_image, lang='eng', config='--psm 6')
        return text
    except Exception as e:
        raise RuntimeError(f"Error processing {image_path}: {e}")

if __name__ == "__main__":
    # If run as a standalone script, prompt the user for the image path.
    image_path = input("Enter the full path to the image: ").strip()
    
    if os.path.exists(image_path):
        extracted_text = extract_text_from_image(image_path)
        print("Extracted text:")
        print(extracted_text)
    else:
        print("The specified image file does not exist.")
