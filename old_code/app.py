import torch
from flask import Flask, request, jsonify
from threading import Thread
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)

# Model variables for CPU usage
dtype = torch.float32  # Use float32 for CPU
model_name = "abhiyanta/Llama-chatDoctor"
max_seq_length = 512
model = None
tokenizer = None

# Alpaca prompt template
alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

def load_model():
    global model, tokenizer
    print("Loading model...")
    # Load model and tokenizer from Hugging Face directly
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=dtype).to("cpu")  # Load on CPU
    print("Model loaded successfully.")

# Load the model in a separate thread when Flask starts
@app.before_first_request
def initialize_model():
    model_loading_thread = Thread(target=load_model)
    model_loading_thread.start()

@app.route('/chat', methods=['POST'])
def chat():
    if model is None or tokenizer is None:
        return jsonify({"error": "Model is still loading, please wait."}), 503

    data = request.get_json()
    instruction = data.get('instruction')
    input_text = data.get('input_text')
    
    # Prepare prompt
    prompt_text = alpaca_prompt.format(instruction, input_text, "")
    
    # Tokenize the input with the model's tokenizer
    inputs = tokenizer([prompt_text], return_tensors="pt").to("cpu")  # Ensure this runs on CPU
    
    # Generate the output using the model
    output = model.generate(**inputs, max_new_tokens=512)
    
    # Decode the output into readable text
    output_text = tokenizer.decode(output[0], skip_special_tokens=True)
    
    return jsonify({"output": output_text})

if __name__ == '__main__':
    # Start the Flask server
    app.run(host='0.0.0.0', port=5000)
