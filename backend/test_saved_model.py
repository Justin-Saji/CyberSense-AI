import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


# ============================================================
# PATH TO YOUR SAVED EMAIL BERT MODEL
# ============================================================

MODEL_PATH = r"C:\projects\CyberSense-AI\Models - Email feature\BERT_Email_Model"


# ============================================================
# CHECK MODEL DIRECTORY
# ============================================================

print("Model path:")
print(MODEL_PATH)

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"\nModel directory does not exist:\n{MODEL_PATH}"
    )

print("\nModel directory exists.")

print("\nFiles found:")

for file in os.listdir(MODEL_PATH):
    print(" -", file)


# ============================================================
# CHECK REQUIRED FILES
# ============================================================

required_files = [
    "config.json",
    "model.safetensors",
    "tokenizer.json",
    "tokenizer_config.json"
]

print("\nChecking required files...")

for file in required_files:

    file_path = os.path.join(MODEL_PATH, file)

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"Required model file missing: {file}"
        )

    print(f"OK: {file}")


# ============================================================
# LOAD TOKENIZER
# ============================================================

print("\nLoading tokenizer...")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH,
    local_files_only=True
)

print("Tokenizer loaded successfully.")


# ============================================================
# LOAD MODEL
# ============================================================

print("\nLoading BERT model...")

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH,
    local_files_only=True
)

print("BERT model loaded successfully.")


# ============================================================
# MODEL INFORMATION
# ============================================================

print("\nModel configuration:")

print("Number of labels:", model.config.num_labels)
print("ID to label:", model.config.id2label)
print("Label to ID:", model.config.label2id)


# ============================================================
# CPU
# ============================================================

device = torch.device("cpu")

model.to(device)
model.eval()

print("\nDevice:", device)


# ============================================================
# TEST EMAIL
# ============================================================

email_text = """
Congratulations! You have won a $1,000 prize.
Click the link below immediately to claim your reward.
Verify your account now or your account will be suspended.
"""


print("\nTesting email:")
print(email_text)


# ============================================================
# TOKENIZATION
# ============================================================

inputs = tokenizer(
    email_text,
    return_tensors="pt",
    truncation=True,
    padding=True,
    max_length=128
)

inputs = {
    key: value.to(device)
    for key, value in inputs.items()
}


# ============================================================
# PREDICTION
# ============================================================

print("\nRunning prediction...")

with torch.no_grad():

    outputs = model(**inputs)

    probabilities = torch.softmax(
        outputs.logits,
        dim=1
    )

    prediction = torch.argmax(
        probabilities,
        dim=1
    ).item()

    confidence = probabilities[0][prediction].item()


# ============================================================
# RESULT
# ============================================================

print("\n========================================")
print("             BERT RESULT")
print("========================================")

print("Prediction ID :", prediction)
print("Confidence    :", round(confidence * 100, 2), "%")

print("Probabilities :", probabilities[0].tolist())

print("========================================")