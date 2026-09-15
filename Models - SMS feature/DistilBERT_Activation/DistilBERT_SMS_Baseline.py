"""
================================================================================
CYBERSENSE AI
DISTILBERT SMS PHISHING / SPAM DETECTION - BASELINE MODEL
================================================================================

Architecture:
    DistilBERT + GELU + 6 Transformer Layers

Dataset:
    SMS Spam Collection (spam.csv)

Original columns:
    v1 = ham / spam
    v2 = SMS message

Final columns:
    label
    message

Label mapping:
    ham  -> 0
    spam -> 1

Purpose:
    This is the FINAL BASELINE DISTILBERT MODEL for the SMS Phishing
    Detection feature of CyberSense AI.

This model is intended to be integrated later with:
    DistilBERT Model
        ↓
    Flask Backend
        ↓
    SMS Detection API
        ↓
    React Website
        ↓
    Prediction Result
        ↓
    Risk Score
        ↓
    Explanation
        ↓
    Database
        ↓
    Dashboard

================================================================================
"""

import os
import random
import json
import numpy as np
import pandas as pd
import torch

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

from datasets import Dataset

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    DataCollatorWithPadding,
    Trainer,
    TrainingArguments
)


# ==============================================================================
# CONFIGURATION
# ==============================================================================

MODEL_NAME = "distilbert-base-uncased"

# Dataset
BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "data" / "spam.csv"

# Output directories
MODEL_DIR = BASE_DIR / "sms_distilbert_model"
RESULTS_DIR = BASE_DIR / "results"

# Training configuration
LEARNING_RATE = 3e-5
EPOCHS = 5
BATCH_SIZE = 8
WEIGHT_DECAY = 0.01
MAX_LENGTH = 128
SEED = 42

# Number of labels
NUM_LABELS = 2

# Label names
ID2LABEL = {
    0: "HAM",
    1: "SPAM"
}

LABEL2ID = {
    "HAM": 0,
    "SPAM": 1
}


# ==============================================================================
# REPRODUCIBILITY
# ==============================================================================

def set_seed(seed=42):

    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


set_seed(SEED)


# ==============================================================================
# CREATE DIRECTORIES
# ==============================================================================

MODEL_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


# ==============================================================================
# HEADER
# ==============================================================================

print()
print("=" * 80)
print("CYBERSENSE AI - DISTILBERT SMS BASELINE MODEL")
print("=" * 80)

print(f"Model              : {MODEL_NAME}")
print("Activation         : GELU")
print("Transformer Layers  : 6")
print(f"Learning Rate      : {LEARNING_RATE}")
print(f"Epochs             : {EPOCHS}")
print(f"Batch Size         : {BATCH_SIZE}")
print(f"Weight Decay       : {WEIGHT_DECAY}")
print(f"Max Length         : {MAX_LENGTH}")
print(f"Seed               : {SEED}")

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Device             : {DEVICE}")

print("=" * 80)


# ==============================================================================
# CHECK DATASET
# ==============================================================================

print()
print("=" * 80)
print("CHECKING DATASET")
print("=" * 80)

print("Dataset path:")
print(DATASET_PATH)

if not DATASET_PATH.exists():

    raise FileNotFoundError(
        f"\nDataset not found:\n{DATASET_PATH}\n\n"
        "Make sure spam.csv is located inside:\n"
        "Models/DistilBERT_Activation/data/"
    )

print()
print("Dataset file found successfully.")


# ==============================================================================
# LOAD DATASET
# ==============================================================================

print()
print("=" * 80)
print("LOADING DATASET")
print("=" * 80)


encodings_to_try = [
    "utf-8",
    "utf-8-sig",
    "cp1252",
    "latin1"
]

df = None

for encoding in encodings_to_try:

    print(f"Trying encoding: {encoding}")

    try:

        df = pd.read_csv(
            DATASET_PATH,
            encoding=encoding
        )

        print(f"Successfully loaded using: {encoding}")

        break

    except Exception:

        print(f"Failed with {encoding}")


if df is None:

    raise RuntimeError(
        "Could not read spam.csv using the supported encodings."
    )


print()
print("Dataset loaded successfully.")

print()
print("Dataset shape:")
print(df.shape)

print()
print("Dataset columns:")
print(df.columns.tolist())

print()
print("First 5 rows:")
print(df.head())


# ==============================================================================
# PREPARE DATASET
# ==============================================================================

print()
print("=" * 80)
print("PREPARING DATASET")
print("=" * 80)


# --------------------------------------------------------------------------
# Detect original SMS Spam Collection format
# --------------------------------------------------------------------------

if "v1" in df.columns and "v2" in df.columns:

    print()
    print("Original SMS Spam Collection format detected.")

    print("Converting v1 -> label")
    print("Converting v2 -> message")

    df = df.rename(
        columns={
            "v1": "label",
            "v2": "message"
        }
    )


elif "label" in df.columns and "message" in df.columns:

    print()
    print("Already prepared dataset detected.")


else:

    raise ValueError(
        "\nDataset format not recognized.\n"
        "Expected either:\n"
        "v1, v2\n"
        "or:\n"
        "label, message"
    )


# ==============================================================================
# CLEAN DATASET
# ==============================================================================

print()
print("=" * 80)
print("CLEANING DATASET")
print("=" * 80)


# Keep only required columns

df = df[["label", "message"]].copy()


# Remove missing values

before_drop = len(df)

df = df.dropna(
    subset=["label", "message"]
)

after_drop = len(df)

if before_drop != after_drop:

    print(
        f"Removed {before_drop - after_drop} rows "
        "with missing values."
    )


# Convert labels to strings

df["label"] = (
    df["label"]
    .astype(str)
    .str.strip()
    .str.lower()
)


print()
print("Original label values:")
print(df["label"].value_counts())


# --------------------------------------------------------------------------
# Correct label conversion
# --------------------------------------------------------------------------

label_mapping = {
    "ham": 0,
    "spam": 1,
    "0": 0,
    "1": 1
}


df["label"] = df["label"].map(label_mapping)


# Remove invalid labels

invalid_count = df["label"].isna().sum()

if invalid_count > 0:

    print()
    print(
        f"WARNING: {invalid_count} rows have invalid labels."
    )

    df = df.dropna(
        subset=["label"]
    )


# Convert labels to integer

df["label"] = df["label"].astype(int)


# Clean message

df["message"] = (
    df["message"]
    .astype(str)
    .str.strip()
)


# Remove empty messages

df = df[
    df["message"].str.len() > 0
].copy()


# Reset index

df = df.reset_index(drop=True)


# ==============================================================================
# DATASET SUMMARY
# ==============================================================================

print()
print("Dataset successfully prepared.")

print()
print("Dataset shape:")
print(df.shape)

print()
print("Final columns:")
print(df.columns.tolist())

print()
print("Label distribution:")
print(df["label"].value_counts())

print()
print("Label meanings:")
print("0 = ham")
print("1 = spam")

print()
print("First 5 rows:")
print(df.head())

print()
print("Label data type:")
print(df["label"].dtype)

print()
print("Unique labels:")
print(sorted(df["label"].unique()))


# ==============================================================================
# VALIDATION
# ==============================================================================

if len(df) == 0:

    raise ValueError(
        "Dataset is empty after cleaning."
    )


if set(df["label"].unique()) != {0, 1}:

    raise ValueError(
        "Dataset must contain both labels 0 and 1."
    )


# ==============================================================================
# TRAIN / TEST SPLIT
# ==============================================================================

print()
print("=" * 80)
print("TRAIN / TEST SPLIT")
print("=" * 80)


train_df, test_df = train_test_split(
    df,
    test_size=0.20,
    random_state=SEED,
    stratify=df["label"]
)


train_df = train_df.reset_index(drop=True)
test_df = test_df.reset_index(drop=True)


print()
print("Training samples:")
print(len(train_df))

print()
print("Testing samples:")
print(len(test_df))


print()
print("Training label distribution:")
print(train_df["label"].value_counts())

print()
print("Testing label distribution:")
print(test_df["label"].value_counts())


# ==============================================================================
# CONVERT TO HUGGING FACE DATASETS
# ==============================================================================

print()
print("=" * 80)
print("CREATING HUGGING FACE DATASETS")
print("=" * 80)


train_dataset = Dataset.from_pandas(
    train_df,
    preserve_index=False
)

test_dataset = Dataset.from_pandas(
    test_df,
    preserve_index=False
)


print()
print("Hugging Face datasets created.")

print()
print(f"Training dataset size: {len(train_dataset)}")
print(f"Testing dataset size : {len(test_dataset)}")


# ==============================================================================
# LOAD TOKENIZER
# ==============================================================================

print()
print("=" * 80)
print("LOADING DISTILBERT TOKENIZER")
print("=" * 80)


tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)


print()
print("Tokenizer loaded successfully.")


# ==============================================================================
# TOKENIZATION
# ==============================================================================

print()
print("=" * 80)
print("TOKENIZING DATASET")
print("=" * 80)


def tokenize_function(examples):

    return tokenizer(
        examples["message"],
        truncation=True,
        max_length=MAX_LENGTH
    )


train_dataset = train_dataset.map(
    tokenize_function,
    batched=True
)

test_dataset = test_dataset.map(
    tokenize_function,
    batched=True
)


print()
print("Tokenization completed successfully.")


# ==============================================================================
# REMOVE UNUSED COLUMNS
# ==============================================================================

train_dataset = train_dataset.remove_columns(
    ["message"]
)

test_dataset = test_dataset.remove_columns(
    ["message"]
)


# ==============================================================================
# DATA COLLATOR
# ==============================================================================

data_collator = DataCollatorWithPadding(
    tokenizer=tokenizer
)


print()
print("Data collator ready.")


# ==============================================================================
# LOAD DISTILBERT MODEL
# ==============================================================================

print()
print("=" * 80)
print("LOADING DISTILBERT MODEL")
print("=" * 80)


model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=NUM_LABELS,
    id2label=ID2LABEL,
    label2id=LABEL2ID
)


print()
print("DistilBERT model loaded successfully.")


# ==============================================================================
# ARCHITECTURE VERIFICATION
# ==============================================================================

print()
print("=" * 80)
print("ARCHITECTURE VERIFICATION")
print("=" * 80)


transformer_layers = model.distilbert.transformer.layer

number_of_layers = len(transformer_layers)

print()
print("Model architecture:")
print("DistilBERT")

print()
print("Transformer layers:")
print(number_of_layers)

print()
print("Expected transformer layers:")
print("6")

print()
print("Activation functions:")

for index, layer in enumerate(
    transformer_layers,
    start=1
):

    print(
        f"Transformer Layer {index}: "
        f"{layer.ffn.lin1.__class__.__name__}"
    )


# DistilBERT uses GELU in its feed-forward activation.
# Verify activation module.

first_layer_activation = transformer_layers[0].ffn.activation

print()
print("Feed-forward activation:")
print(first_layer_activation)


if number_of_layers != 6:

    raise ValueError(
        f"Expected 6 Transformer layers, "
        f"but found {number_of_layers}."
    )


print()
print("Architecture verified:")
print("DistilBERT + GELU + 6 Transformer Layers")


# ==============================================================================
# MOVE MODEL TO DEVICE
# ==============================================================================

model.to(DEVICE)


print()
print("Model moved to device:")
print(DEVICE)


# ==============================================================================
# METRICS
# ==============================================================================

def compute_metrics(eval_pred):

    predictions, labels = eval_pred

    predictions = np.argmax(
        predictions,
        axis=1
    )

    accuracy = accuracy_score(
        labels,
        predictions
    )

    precision = precision_score(
        labels,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        labels,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        labels,
        predictions,
        zero_division=0
    )

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1
    }


# ==============================================================================
# TRAINING ARGUMENTS
# ==============================================================================

print()
print("=" * 80)
print("TRAINING ARGUMENTS")
print("=" * 80)


training_args = TrainingArguments(

    output_dir=str(
        MODEL_DIR / "checkpoints"
    ),

    num_train_epochs=EPOCHS,

    per_device_train_batch_size=BATCH_SIZE,

    per_device_eval_batch_size=BATCH_SIZE,

    learning_rate=LEARNING_RATE,

    weight_decay=WEIGHT_DECAY,

    logging_strategy="epoch",

    eval_strategy="epoch",

    save_strategy="epoch",

    load_best_model_at_end=True,

    metric_for_best_model="f1",

    greater_is_better=True,

    save_total_limit=2,

    report_to="none",

    seed=SEED,

    data_seed=SEED,

    fp16=False,

    dataloader_pin_memory=False
)


print()
print(training_args)


# ==============================================================================
# CREATE TRAINER
# ==============================================================================

print()
print("=" * 80)
print("CREATING TRAINER")
print("=" * 80)


trainer = Trainer(

    model=model,

    args=training_args,

    train_dataset=train_dataset,

    eval_dataset=test_dataset,

    data_collator=data_collator,

    compute_metrics=compute_metrics
)


print()
print("Trainer created successfully.")


# ==============================================================================
# TRAIN MODEL
# ==============================================================================

print()
print("=" * 80)
print("STARTING TRAINING")
print("=" * 80)


print()
print("Training configuration:")

print(f"Model              : {MODEL_NAME}")
print("Activation         : GELU")
print(f"Transformer layers : {number_of_layers}")
print(f"Learning rate      : {LEARNING_RATE}")
print(f"Epochs             : {EPOCHS}")
print(f"Batch size         : {BATCH_SIZE}")
print(f"Device             : {DEVICE}")


train_result = trainer.train()


# ==============================================================================
# SAVE TRAINING STATE
# ==============================================================================

print()
print("=" * 80)
print("SAVING TRAINING STATE")
print("=" * 80)


trainer.save_state()


# ==============================================================================
# SAVE MODEL
# ==============================================================================

print()
print("=" * 80)
print("SAVING FINAL MODEL")
print("=" * 80)


trainer.save_model(
    str(MODEL_DIR)
)

tokenizer.save_pretrained(
    str(MODEL_DIR)
)


print()
print("Model saved successfully.")

print()
print("Model directory:")
print(MODEL_DIR)


# ==============================================================================
# FINAL EVALUATION
# ==============================================================================

print()
print("=" * 80)
print("FINAL EVALUATION")
print("=" * 80)


evaluation_results = trainer.evaluate(
    test_dataset
)


# ==============================================================================
# PREDICTIONS
# ==============================================================================

print()
print("=" * 80)
print("GENERATING PREDICTIONS")
print("=" * 80)


prediction_output = trainer.predict(
    test_dataset
)


predictions = np.argmax(
    prediction_output.predictions,
    axis=1
)

true_labels = prediction_output.label_ids


# ==============================================================================
# FINAL METRICS
# ==============================================================================

accuracy = accuracy_score(
    true_labels,
    predictions
)

precision = precision_score(
    true_labels,
    predictions,
    zero_division=0
)

recall = recall_score(
    true_labels,
    predictions,
    zero_division=0
)

f1 = f1_score(
    true_labels,
    predictions,
    zero_division=0
)


print()
print("=" * 80)
print("DISTILBERT SMS BASELINE RESULTS")
print("=" * 80)

print()
print(f"Accuracy  : {accuracy * 100:.2f}%")
print(f"Precision : {precision * 100:.2f}%")
print(f"Recall    : {recall * 100:.2f}%")
print(f"F1 Score  : {f1 * 100:.2f}%")


# ==============================================================================
# CONFUSION MATRIX
# ==============================================================================

print()
print("=" * 80)
print("CONFUSION MATRIX")
print("=" * 80)


cm = confusion_matrix(
    true_labels,
    predictions
)


print()
print(cm)


# ==============================================================================
# CLASSIFICATION REPORT
# ==============================================================================

print()
print("=" * 80)
print("CLASSIFICATION REPORT")
print("=" * 80)


report = classification_report(
    true_labels,
    predictions,
    target_names=[
        "Ham",
        "Spam"
    ],
    digits=4,
    zero_division=0
)


print()
print(report)


# ==============================================================================
# SAVE RESULTS CSV
# ==============================================================================

print()
print("=" * 80)
print("SAVING RESULTS")
print("=" * 80)


results_df = pd.DataFrame(
    [{
        "model": MODEL_NAME,
        "activation": "GELU",
        "transformer_layers": number_of_layers,
        "learning_rate": LEARNING_RATE,
        "epochs": EPOCHS,
        "batch_size": BATCH_SIZE,
        "weight_decay": WEIGHT_DECAY,
        "max_length": MAX_LENGTH,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "test_samples": len(test_df),
        "seed": SEED
    }]
)


results_path = (
    RESULTS_DIR /
    "DistilBERT_SMS_Baseline_results.csv"
)


results_df.to_csv(
    results_path,
    index=False
)


print()
print("Results saved to:")
print(results_path)


# ==============================================================================
# SAVE CONFUSION MATRIX
# ==============================================================================

cm_df = pd.DataFrame(
    cm,
    index=[
        "Actual_Ham",
        "Actual_Spam"
    ],
    columns=[
        "Predicted_Ham",
        "Predicted_Spam"
    ]
)


cm_path = (
    RESULTS_DIR /
    "DistilBERT_SMS_Baseline_confusion_matrix.csv"
)


cm_df.to_csv(
    cm_path
)


print()
print("Confusion matrix saved to:")
print(cm_path)


# ==============================================================================
# SAVE CLASSIFICATION REPORT
# ==============================================================================

report_path = (
    RESULTS_DIR /
    "DistilBERT_SMS_Baseline_classification_report.txt"
)


with open(
    report_path,
    "w",
    encoding="utf-8"
) as file:

    file.write(report)


print()
print("Classification report saved to:")
print(report_path)


# ==============================================================================
# SAVE MODEL CONFIGURATION
# ==============================================================================

model_config = {

    "project": "CyberSense AI",

    "feature": "SMS Phishing Detection",

    "model": MODEL_NAME,

    "architecture": {
        "base_model": "DistilBERT",
        "activation": "GELU",
        "transformer_layers": number_of_layers
    },

    "dataset": {
        "file": str(DATASET_PATH),
        "total_samples": len(df),
        "training_samples": len(train_df),
        "testing_samples": len(test_df)
    },

    "labels": {
        "0": "ham",
        "1": "spam"
    },

    "tokenization": {
        "max_length": MAX_LENGTH,
        "truncation": True
    },

    "training": {
        "learning_rate": LEARNING_RATE,
        "epochs": EPOCHS,
        "batch_size": BATCH_SIZE,
        "weight_decay": WEIGHT_DECAY,
        "seed": SEED
    },

    "performance": {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1)
    }

}


config_path = (
    MODEL_DIR /
    "model_config.json"
)


with open(
    config_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        model_config,
        file,
        indent=4
    )


print()
print("Model configuration saved to:")
print(config_path)


# ==============================================================================
# SAVE TEST PREDICTIONS
# ==============================================================================

prediction_df = test_df.copy()

prediction_df["actual_label"] = prediction_df["label"]

prediction_df["predicted_label"] = predictions

prediction_df["actual_class"] = (
    prediction_df["actual_label"]
    .map({
        0: "ham",
        1: "spam"
    })
)

prediction_df["predicted_class"] = (
    prediction_df["predicted_label"]
    .map({
        0: "ham",
        1: "spam"
    })
)


prediction_path = (
    RESULTS_DIR /
    "DistilBERT_SMS_Baseline_predictions.csv"
)


prediction_df.to_csv(
    prediction_path,
    index=False
)


print()
print("Prediction results saved to:")
print(prediction_path)


# ==============================================================================
# FINAL SUMMARY
# ==============================================================================

print()
print("=" * 80)
print("DISTILBERT SMS BASELINE EXPERIMENT COMPLETED")
print("=" * 80)

print()
print("FINAL ARCHITECTURE")
print("------------------")
print("Model              : DistilBERT")
print("Model Name         : distilbert-base-uncased")
print("Activation         : GELU")
print("Transformer Layers : 6")
print("Classification     : Binary")
print("Dataset            : SMS Spam Collection")
print("Maximum Length     : 128")

print()
print("FINAL PERFORMANCE")
print("-----------------")
print(f"Accuracy           : {accuracy * 100:.2f}%")
print(f"Precision          : {precision * 100:.2f}%")
print(f"Recall             : {recall * 100:.2f}%")
print(f"F1 Score           : {f1 * 100:.2f}%")

print()
print("MODEL LOCATION")
print("--------------")
print(MODEL_DIR)

print()
print("This saved model is ready for the next stage:")
print("Flask SMS Detection API integration.")

print()
print("=" * 80)
print("EXPERIMENT FINISHED")
print("=" * 80)