import os
import pickle
import time

import numpy as np
import pandas as pd
import tensorflow as tf

from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

from tensorflow.keras.models import Sequential

from tensorflow.keras.layers import (
    Embedding,
    LSTM,
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
# CONFIG
# ============================================================

DATA_DIR = "url_dataset"

MAX_VOCAB = 200
MAX_LENGTH = 200

EMBEDDING_DIM = 128
LSTM_UNITS = 128

EPOCHS = 10
BATCH_SIZE = 128

# ============================================================
# LOAD
# ============================================================

train = pd.read_csv(
    os.path.join(DATA_DIR, "train.csv")
)

val = pd.read_csv(
    os.path.join(DATA_DIR, "validation.csv")
)

test = pd.read_csv(
    os.path.join(DATA_DIR, "test.csv")
)

X_train_text = train["URL"].astype(str).tolist()
X_val_text = val["URL"].astype(str).tolist()
X_test_text = test["URL"].astype(str).tolist()

y_train = train["label"].values
y_val = val["label"].values
y_test = test["label"].values

# ============================================================
# TOKENIZATION
# ============================================================

tokenizer = Tokenizer(
    num_words=MAX_VOCAB,
    char_level=True,
    oov_token="<OOV>"
)

tokenizer.fit_on_texts(
    X_train_text
)

def encode(texts):
    sequences = tokenizer.texts_to_sequences(texts)

    return pad_sequences(
        sequences,
        maxlen=MAX_LENGTH,
        padding="post",
        truncating="post"
    )

X_train = encode(X_train_text)
X_val = encode(X_val_text)
X_test = encode(X_test_text)

# ============================================================
# MODEL
# ============================================================

model = Sequential([

    Embedding(
        MAX_VOCAB,
        EMBEDDING_DIM,
        input_length=MAX_LENGTH
    ),

    LSTM(
        LSTM_UNITS
    ),

    Dropout(0.4),

    Dense(
        64,
        activation="relu"
    ),

    Dropout(0.3),

    Dense(
        1,
        activation="sigmoid"
    )
])

model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ============================================================
# TRAIN
# ============================================================

start = time.time()

model.fit(
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
    ]
)

training_time = time.time() - start

# ============================================================
# TEST
# ============================================================

probabilities = model.predict(
    X_test,
    batch_size=BATCH_SIZE
).ravel()

predictions = (
    probabilities >= 0.5
).astype(int)

accuracy = accuracy_score(
    y_test,
    predictions
)

precision = precision_score(
    y_test,
    predictions
)

recall = recall_score(
    y_test,
    predictions
)

f1 = f1_score(
    y_test,
    predictions
)

print("\nLSTM RESULTS")

print("Accuracy :", accuracy)
print("Precision:", precision)
print("Recall   :", recall)
print("F1       :", f1)

print(
    classification_report(
        y_test,
        predictions,
        target_names=[
            "Legitimate",
            "Phishing"
        ]
    )
)

print(
    confusion_matrix(
        y_test,
        predictions
    )
)

# ============================================================
# SAVE
# ============================================================

os.makedirs(
    "url_models",
    exist_ok=True
)

model.save(
    "url_models/url_lstm.keras"
)

with open(
    "url_models/url_lstm_tokenizer.pkl",
    "wb"
) as f:

    pickle.dump(
        tokenizer,
        f
    )

print("\nTraining time:", training_time)
print("LSTM model saved.")