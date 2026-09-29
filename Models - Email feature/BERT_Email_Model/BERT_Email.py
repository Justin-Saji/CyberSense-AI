"""
===============================================================================
CYBERSENSE AI
EMAIL PHISHING DETECTION - BERT BASELINE MODEL
===============================================================================

Model:
    BERT-base-uncased

Architecture:
    BERT + GELU + 12 Transformer Encoder Layers

Dataset:
    messages.csv

Purpose:
    Train and evaluate BERT for Email Phishing Detection.

Metrics:
    Accuracy
    Precision
    Recall
    F1 Score
    Confusion Matrix
    Classification Report
===============================================================================
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


# =============================================================================
# CONFIGURATION
# =============================================================================

MODEL_NAME = "bert-base-uncased"

MODEL_DISPLAY_NAME = "BERT-base-uncased"

BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = BASE_DIR / "dataset" / "messages.csv"

MODEL_DIR = BASE_DIR / "BERT_Email_Model"

RESULTS_DIR = BASE_DIR / "results"

LEARNING_RATE = 3e-5

EPOCHS = 5

BATCH_SIZE = 8

WEIGHT_DECAY = 0.01

MAX_LENGTH = 128

SEED = 42

NUM_LABELS = 2


# =============================================================================
# IMPORTANT DATASET COLUMN CONFIGURATION
# =============================================================================
#
# Change these two values ONLY if your messages.csv uses different names.
#
# Example:
#
# TEXT_COLUMN = "message"
# LABEL_COLUMN = "label"
#
# If your dataset contains:
#
# message,text
# label,class
#
# change them accordingly.
# =============================================================================

TEXT_COLUMN = "message"

LABEL_COLUMN = "label"


ID2LABEL = {
    0: "LEGITIMATE",
    1: "PHISHING"
}

LABEL2ID = {
    "LEGITIMATE": 0,
    "PHISHING": 1
}


# =============================================================================
# REPRODUCIBILITY
# =============================================================================

def set_seed(seed=42):

    random.seed(seed)

    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():

        torch.cuda.manual_seed_all(seed)


set_seed(SEED)


# =============================================================================
# CREATE DIRECTORIES
# =============================================================================

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

RESULTS_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =============================================================================
# HEADER
# =============================================================================

print()

print("=" * 80)

print("CYBERSENSE AI - BERT EMAIL PHISHING DETECTION")

print("=" * 80)

print()

print(f"Model              : {MODEL_DISPLAY_NAME}")

print("Activation         : GELU")

print("Transformer Layers  : 12")

print(f"Learning Rate      : {LEARNING_RATE}")

print(f"Epochs             : {EPOCHS}")

print(f"Batch Size         : {BATCH_SIZE}")

print(f"Weight Decay       : {WEIGHT_DECAY}")

print(f"Max Length         : {MAX_LENGTH}")

print(f"Seed               : {SEED}")

DEVICE = (
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

print(f"Device             : {DEVICE}")

print("=" * 80)


# =============================================================================
# CHECK DATASET
# =============================================================================

print()

print("=" * 80)

print("CHECKING DATASET")

print("=" * 80)

print()

print("Dataset path:")

print(DATASET_PATH)


if not DATASET_PATH.exists():

    raise FileNotFoundError(
        f"\nDataset not found:\n{DATASET_PATH}\n"
    )


print()

print("Dataset file found successfully.")


# =============================================================================
# LOAD DATASET
# =============================================================================

print()

print("=" * 80)

print("LOADING DATASET")

print("=" * 80)


encodings = [
    "utf-8",
    "utf-8-sig",
    "cp1252",
    "latin1"
]

df = None


for encoding in encodings:

    print(
        f"Trying encoding: {encoding}"
    )

    try:

        df = pd.read_csv(
            DATASET_PATH,
            encoding=encoding
        )

        print(
            f"Successfully loaded using: {encoding}"
        )

        break

    except Exception as error:

        print(
            f"Failed with {encoding}: {error}"
        )


if df is None:

    raise RuntimeError(
        "Could not load messages.csv."
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


# =============================================================================
# VALIDATE COLUMNS
# =============================================================================

if TEXT_COLUMN not in df.columns:

    raise ValueError(
        f"\nText column '{TEXT_COLUMN}' was not found.\n"
        f"Available columns: {df.columns.tolist()}\n"
        "Change TEXT_COLUMN in the configuration."
    )


if LABEL_COLUMN not in df.columns:

    raise ValueError(
        f"\nLabel column '{LABEL_COLUMN}' was not found.\n"
        f"Available columns: {df.columns.tolist()}\n"
        "Change LABEL_COLUMN in the configuration."
    )


# =============================================================================
# PREPARE DATASET
# =============================================================================

print()

print("=" * 80)

print("PREPARING DATASET")

print("=" * 80)


df = df[
    [LABEL_COLUMN, TEXT_COLUMN]
].copy()


df = df.rename(
    columns={
        LABEL_COLUMN: "label",
        TEXT_COLUMN: "message"
    }
)


# =============================================================================
# REMOVE MISSING VALUES
# =============================================================================

before = len(df)


df = df.dropna(
    subset=[
        "label",
        "message"
    ]
)


after = len(df)


print()

print(
    f"Removed {before - after} rows with missing values."
)


# =============================================================================
# CLEAN TEXT
# =============================================================================

df["message"] = (
    df["message"]
    .astype(str)
    .str.strip()
)


df = df[
    df["message"].str.len() > 0
].copy()


# =============================================================================
# CLEAN LABELS
# =============================================================================

df["label"] = (
    df["label"]
    .astype(str)
    .str.strip()
    .str.lower()
)


print()

print("Original label distribution:")

print(
    df["label"].value_counts()
)


# =============================================================================
# LABEL MAPPING
# =============================================================================

#
# IMPORTANT:
#
# The mapping below assumes:
#
# 0 / legitimate / ham / safe / benign
#       -> 0
#
# 1 / phishing / spam / malicious
#       -> 1
#
# If your messages.csv uses different labels,
# modify this dictionary.
#

label_mapping = {

    "0": 0,

    "1": 1,

    "legitimate": 0,

    "legit": 0,

    "ham": 0,

    "safe": 0,

    "benign": 0,

    "normal": 0,

    "phishing": 1,

    "spam": 1,

    "malicious": 1,

    "fraud": 1

}


df["label"] = df["label"].map(
    label_mapping
)


# =============================================================================
# REMOVE INVALID LABELS
# =============================================================================

invalid = df["label"].isna().sum()


if invalid > 0:

    print()

    print(
        f"WARNING: {invalid} rows have invalid labels."
    )

    df = df.dropna(
        subset=["label"]
    )


df["label"] = df["label"].astype(int)


df = df.reset_index(
    drop=True
)


# =============================================================================
# VALIDATION
# =============================================================================

if len(df) == 0:

    raise ValueError(
        "Dataset is empty after cleaning."
    )


if set(df["label"].unique()) != {0, 1}:

    raise ValueError(
        "Dataset must contain exactly two classes: 0 and 1."
    )


# =============================================================================
# DATASET SUMMARY
# =============================================================================

print()

print("=" * 80)

print("CLEANED DATASET SUMMARY")

print("=" * 80)

print()

print("Dataset shape:")

print(df.shape)

print()

print("Label distribution:")

print(
    df["label"].value_counts()
)

print()

print("Label meanings:")

print("0 = Legitimate")

print("1 = Phishing")


# =============================================================================
# TRAIN / TEST SPLIT
# =============================================================================

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


train_df = train_df.reset_index(
    drop=True
)

test_df = test_df.reset_index(
    drop=True
)


print()

print(
    f"Training samples: {len(train_df)}"
)

print(
    f"Testing samples : {len(test_df)}"
)


# =============================================================================
# HUGGING FACE DATASETS
# =============================================================================

train_dataset = Dataset.from_pandas(
    train_df,
    preserve_index=False
)

test_dataset = Dataset.from_pandas(
    test_df,
    preserve_index=False
)


# =============================================================================
# TOKENIZER
# =============================================================================

print()

print("=" * 80)

print("LOADING BERT TOKENIZER")

print("=" * 80)


tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)


print()

print("Tokenizer loaded successfully.")


# =============================================================================
# TOKENIZATION
# =============================================================================

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


# Remove original message column

train_dataset = train_dataset.remove_columns(
    ["message"]
)

test_dataset = test_dataset.remove_columns(
    ["message"]
)


# =============================================================================
# DATA COLLATOR
# =============================================================================

data_collator = DataCollatorWithPadding(
    tokenizer=tokenizer
)


# =============================================================================
# LOAD MODEL
# =============================================================================

print()

print("=" * 80)

print("LOADING BERT MODEL")

print("=" * 80)


model = AutoModelForSequenceClassification.from_pretrained(

    MODEL_NAME,

    num_labels=NUM_LABELS,

    id2label=ID2LABEL,

    label2id=LABEL2ID

)


# =============================================================================
# ARCHITECTURE VERIFICATION
# =============================================================================

print()

print("=" * 80)

print("ARCHITECTURE VERIFICATION")

print("=" * 80)


number_of_layers = len(
    model.bert.encoder.layer
)


print()

print(
    f"Transformer layers found: {number_of_layers}"
)


print()

print("Expected layers: 12")


if number_of_layers != 12:

    raise ValueError(
        f"Expected 12 BERT transformer layers, "
        f"but found {number_of_layers}."
    )


print()

print("Activation function:")

print(
    model.config.hidden_act
)


print()

print(
    "Architecture verified:"
)

print(
    "BERT + GELU + 12 Transformer Layers"
)


# =============================================================================
# MOVE MODEL
# =============================================================================

model.to(DEVICE)


# =============================================================================
# METRICS
# =============================================================================

def compute_metrics(eval_pred):

    predictions, labels = eval_pred

    predictions = np.argmax(
        predictions,
        axis=1
    )

    return {

        "accuracy": accuracy_score(
            labels,
            predictions
        ),

        "precision": precision_score(
            labels,
            predictions,
            zero_division=0
        ),

        "recall": recall_score(
            labels,
            predictions,
            zero_division=0
        ),

        "f1": f1_score(
            labels,
            predictions,
            zero_division=0
        )

    }


# =============================================================================
# TRAINING ARGUMENTS
# =============================================================================

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


# =============================================================================
# TRAINER
# =============================================================================

trainer = Trainer(

    model=model,

    args=training_args,

    train_dataset=train_dataset,

    eval_dataset=test_dataset,

    data_collator=data_collator,

    compute_metrics=compute_metrics,

    processing_class=tokenizer

)


print()

print("Trainer created successfully.")


# =============================================================================
# TRAIN
# =============================================================================

print()

print("=" * 80)

print("STARTING BERT TRAINING")

print("=" * 80)


trainer.train()


# =============================================================================
# SAVE MODEL
# =============================================================================

print()

print("=" * 80)

print("SAVING MODEL")

print("=" * 80)


trainer.save_model(
    str(MODEL_DIR)
)

tokenizer.save_pretrained(
    str(MODEL_DIR)
)


# =============================================================================
# FINAL EVALUATION
# =============================================================================

print()

print("=" * 80)

print("FINAL EVALUATION")

print("=" * 80)


prediction_output = trainer.predict(
    test_dataset
)


predictions = np.argmax(
    prediction_output.predictions,
    axis=1
)

true_labels = prediction_output.label_ids


# =============================================================================
# METRICS
# =============================================================================

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


# =============================================================================
# RESULTS
# =============================================================================

print()

print("=" * 80)

print("BERT EMAIL PHISHING RESULTS")

print("=" * 80)

print()

print(
    f"Accuracy  : {accuracy * 100:.2f}%"
)

print(
    f"Precision : {precision * 100:.2f}%"
)

print(
    f"Recall    : {recall * 100:.2f}%"
)

print(
    f"F1 Score  : {f1 * 100:.2f}%"
)


# =============================================================================
# CONFUSION MATRIX
# =============================================================================

cm = confusion_matrix(
    true_labels,
    predictions
)


print()

print("=" * 80)

print("CONFUSION MATRIX")

print("=" * 80)

print()

print(cm)


cm_df = pd.DataFrame(

    cm,

    index=[
        "Actual_Legitimate",
        "Actual_Phishing"
    ],

    columns=[
        "Predicted_Legitimate",
        "Predicted_Phishing"
    ]

)


cm_df.to_csv(
    RESULTS_DIR / "BERT_confusion_matrix.csv"
)


# =============================================================================
# CLASSIFICATION REPORT
# =============================================================================

report = classification_report(

    true_labels,

    predictions,

    target_names=[
        "Legitimate",
        "Phishing"
    ],

    digits=4,

    zero_division=0

)


print()

print("=" * 80)

print("CLASSIFICATION REPORT")

print("=" * 80)

print()

print(report)


with open(

    RESULTS_DIR /
    "BERT_classification_report.txt",

    "w",

    encoding="utf-8"

) as file:

    file.write(report)


# =============================================================================
# SAVE RESULTS
# =============================================================================

results = pd.DataFrame([{

    "model": MODEL_NAME,

    "architecture": "BERT + GELU + 12 Transformer Layers",

    "accuracy": accuracy,

    "precision": precision,

    "recall": recall,

    "f1": f1,

    "learning_rate": LEARNING_RATE,

    "epochs": EPOCHS,

    "batch_size": BATCH_SIZE,

    "weight_decay": WEIGHT_DECAY,

    "max_length": MAX_LENGTH,

    "train_samples": len(train_df),

    "test_samples": len(test_df),

    "seed": SEED

}])


results_path = (
    RESULTS_DIR /
    "BERT_Email_results.csv"
)


results.to_csv(
    results_path,
    index=False
)


# =============================================================================
# FINAL SUMMARY
# =============================================================================

print()

print("=" * 80)

print("BERT EMAIL PHISHING EXPERIMENT COMPLETED")

print("=" * 80)

print()

print("Architecture")

print("----------------")

print("Model              : BERT-base-uncased")

print("Activation         : GELU")

print("Transformer Layers : 12")

print("Classification     : Binary")

print()

print("Performance")

print("----------------")

print(
    f"Accuracy           : {accuracy * 100:.2f}%"
)

print(
    f"Precision          : {precision * 100:.2f}%"
)

print(
    f"Recall             : {recall * 100:.2f}%"
)

print(
    f"F1 Score           : {f1 * 100:.2f}%"
)

print()

print("Model saved to:")

print(MODEL_DIR)

print()

print("=" * 80)