import os
import time
import pickle

import numpy as np
import pandas as pd
import tensorflow as tf

from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

from tensorflow.keras.models import Sequential

from tensorflow.keras.layers import (
    Embedding,
    Conv1D,
    GlobalMaxPooling1D,
    Dense,
    Dropout
)

from tensorflow.keras.callbacks import EarlyStopping

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)


# ============================================================
# CONFIGURATION
# ============================================================

DATA_DIR = "url_dataset"
MODEL_DIR = "url_models"

MAX_VOCAB = 200
MAX_LENGTH = 200

EMBEDDING_DIM = 128

EPOCHS = 10
BATCH_SIZE = 128

RANDOM_STATE = 42


# ============================================================
# CREATE MODEL DIRECTORY
# ============================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# ============================================================
# LOAD DATASET
# ============================================================

print("=" * 70)
print("LOADING URL DATASET")
print("=" * 70)

train_df = pd.read_csv(
    os.path.join(
        DATA_DIR,
        "train.csv"
    )
)

val_df = pd.read_csv(
    os.path.join(
        DATA_DIR,
        "validation.csv"
    )
)

test_df = pd.read_csv(
    os.path.join(
        DATA_DIR,
        "test.csv"
    )
)


print(
    f"Training samples  : {len(train_df)}"
)

print(
    f"Validation samples: {len(val_df)}"
)

print(
    f"Test samples      : {len(test_df)}"
)


# ============================================================
# CHECK COLUMNS
# ============================================================

print("\nTrain columns:")
print(train_df.columns.tolist())


# ============================================================
# FIND URL COLUMN
# ============================================================

if "URL" in train_df.columns:
    url_column = "URL"

elif "url" in train_df.columns:
    url_column = "url"

else:
    raise ValueError(
        "URL column not found in train.csv"
    )


# ============================================================
# FIND LABEL COLUMN
# ============================================================

if "label" in train_df.columns:
    label_column = "label"

elif "Label" in train_df.columns:
    label_column = "Label"

elif "LABEL" in train_df.columns:
    label_column = "LABEL"

else:
    raise ValueError(
        "Label column not found in train.csv"
    )


print(
    f"\nURL column  : {url_column}"
)

print(
    f"Label column: {label_column}"
)


# ============================================================
# CLEAN URL DATA
# ============================================================

train_df[url_column] = (
    train_df[url_column]
    .astype(str)
    .str.strip()
)

val_df[url_column] = (
    val_df[url_column]
    .astype(str)
    .str.strip()
)

test_df[url_column] = (
    test_df[url_column]
    .astype(str)
    .str.strip()
)


# ============================================================
# CONVERT LABELS
# ============================================================

def convert_labels(series):

    # Convert to string first
    labels = (
        series
        .astype(str)
        .str.strip()
        .str.lower()
    )

    # Map original dataset labels
    label_mapping = {
        "good": 0,
        "bad": 1,

        "legitimate": 0,
        "benign": 0,

        "phishing": 1,
        "malicious": 1
    }

    # If labels are strings, map them
    mapped = labels.map(label_mapping)

    # Handle already numeric labels
    numeric = pd.to_numeric(
        series,
        errors="coerce"
    )

    mapped = mapped.fillna(
        numeric
    )

    # Check for unknown labels
    if mapped.isna().any():

        unknown = series[
            mapped.isna()
        ].unique()

        raise ValueError(
            f"Unknown labels found: {unknown}"
        )

    return mapped.astype(int).values


y_train = convert_labels(
    train_df[label_column]
)

y_val = convert_labels(
    val_df[label_column]
)

y_test = convert_labels(
    test_df[label_column]
)


# ============================================================
# VERIFY LABEL DISTRIBUTION
# ============================================================

print("\nLabel distribution:")

print(
    "Training:"
)

print(
    pd.Series(y_train)
    .value_counts()
    .sort_index()
)

print(
    "\nValidation:"
)

print(
    pd.Series(y_val)
    .value_counts()
    .sort_index()
)

print(
    "\nTest:"
)

print(
    pd.Series(y_test)
    .value_counts()
    .sort_index()
)


# ============================================================
# TEXT DATA
# ============================================================

X_train_text = (
    train_df[url_column]
    .tolist()
)

X_val_text = (
    val_df[url_column]
    .tolist()
)

X_test_text = (
    test_df[url_column]
    .tolist()
)


# ============================================================
# CHARACTER TOKENIZER
# ============================================================

print("\n" + "=" * 70)
print("CREATING CHARACTER TOKENIZER")
print("=" * 70)

tokenizer = Tokenizer(
    num_words=MAX_VOCAB,
    char_level=True,
    oov_token="<OOV>"
)

tokenizer.fit_on_texts(
    X_train_text
)

print(
    "Vocabulary size:",
    len(tokenizer.word_index)
)


# ============================================================
# CONVERT URLS TO SEQUENCES
# ============================================================

print("\nConverting URLs to sequences...")

X_train_sequences = (
    tokenizer.texts_to_sequences(
        X_train_text
    )
)

X_val_sequences = (
    tokenizer.texts_to_sequences(
        X_val_text
    )
)

X_test_sequences = (
    tokenizer.texts_to_sequences(
        X_test_text
    )
)


# ============================================================
# PAD SEQUENCES
# ============================================================

print(
    f"Padding sequences to length {MAX_LENGTH}..."
)

X_train = pad_sequences(
    X_train_sequences,
    maxlen=MAX_LENGTH,
    padding="post",
    truncating="post"
)

X_val = pad_sequences(
    X_val_sequences,
    maxlen=MAX_LENGTH,
    padding="post",
    truncating="post"
)

X_test = pad_sequences(
    X_test_sequences,
    maxlen=MAX_LENGTH,
    padding="post",
    truncating="post"
)


print(
    "\nTraining shape:",
    X_train.shape
)

print(
    "Validation shape:",
    X_val.shape
)

print(
    "Test shape:",
    X_test.shape
)


# ============================================================
# CNN MODEL
# ============================================================

print("\n" + "=" * 70)
print("BUILDING CNN MODEL")
print("=" * 70)

model = Sequential([

    Embedding(
        input_dim=MAX_VOCAB,
        output_dim=EMBEDDING_DIM
    ),

    Conv1D(
        filters=128,
        kernel_size=5,
        activation="relu"
    ),

    GlobalMaxPooling1D(),

    Dense(
        128,
        activation="relu"
    ),

    Dropout(
        0.4
    ),

    Dense(
        1,
        activation="sigmoid"
    )
])


# ============================================================
# COMPILE
# ============================================================

model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=[
        "accuracy"
    ]
)


# ============================================================
# MODEL SUMMARY
# ============================================================

model.summary()


# ============================================================
# TRAIN
# ============================================================

print("\n" + "=" * 70)
print("TRAINING CNN")
print("=" * 70)

start_time = time.time()

history = model.fit(

    X_train,
    y_train,

    validation_data=(
        X_val,
        y_val
    ),

    epochs=EPOCHS,

    batch_size=BATCH_SIZE,

    callbacks=[
        EarlyStopping(
            monitor="val_loss",
            patience=3,
            restore_best_weights=True
        )
    ],

    verbose=1
)

training_time = (
    time.time() - start_time
)


# ============================================================
# PREDICTION
# ============================================================

print("\n" + "=" * 70)
print("EVALUATING CNN")
print("=" * 70)

probabilities = model.predict(
    X_test,
    batch_size=BATCH_SIZE,
    verbose=1
).ravel()


predictions = (
    probabilities >= 0.5
).astype(int)


# ============================================================
# METRICS
# ============================================================

accuracy = accuracy_score(
    y_test,
    predictions
)

precision = precision_score(
    y_test,
    predictions,
    zero_division=0
)

recall = recall_score(
    y_test,
    predictions,
    zero_division=0
)

f1 = f1_score(
    y_test,
    predictions,
    zero_division=0
)


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 70)
print("CNN RESULTS")
print("=" * 70)

print(
    f"Accuracy : {accuracy:.4f}"
)

print(
    f"Precision: {precision:.4f}"
)

print(
    f"Recall   : {recall:.4f}"
)

print(
    f"F1 Score : {f1:.4f}"
)

print(
    f"Training Time: {training_time:.2f} seconds"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions,
        target_names=[
            "Legitimate",
            "Phishing"
        ],
        zero_division=0
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\nConfusion Matrix:")

print(
    confusion_matrix(
        y_test,
        predictions
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

model_path = os.path.join(
    MODEL_DIR,
    "url_cnn.keras"
)

model.save(
    model_path
)


# ============================================================
# SAVE TOKENIZER
# ============================================================

tokenizer_path = os.path.join(
    MODEL_DIR,
    "url_cnn_tokenizer.pkl"
)

with open(
    tokenizer_path,
    "wb"
) as file:

    pickle.dump(
        tokenizer,
        file
    )


# ============================================================
# SAVE TRAINING HISTORY
# ============================================================

history_df = pd.DataFrame(
    history.history
)

history_df.to_csv(
    os.path.join(
        MODEL_DIR,
        "cnn_training_history.csv"
    ),
    index=False
)


# ============================================================
# FINAL
# ============================================================

print("\n" + "=" * 70)
print("CNN TRAINING COMPLETE")
print("=" * 70)

print(
    f"Model saved to: {model_path}"
)

print(
    f"Tokenizer saved to: {tokenizer_path}"
)

print(
    f"Training history saved to: "
    f"{MODEL_DIR}\\cnn_training_history.csv"
)