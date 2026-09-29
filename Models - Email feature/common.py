import os
import re
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

DATASET_PATH = "dataset/messages.csv"

RESULTS_DIR = "results"
MODELS_DIR = "models"

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)


def clean_text(text):
    if pd.isna(text):
        return ""

    text = str(text)

    text = text.lower()

    # Remove HTML
    text = re.sub(r"<[^>]+>", " ", text)

    # Replace URLs
    text = re.sub(
        r"https?://\S+|www\.\S+",
        " URL ",
        text
    )

    # Replace email addresses
    text = re.sub(
        r"\b[\w\.-]+@[\w\.-]+\.\w+\b",
        " EMAIL ",
        text
    )

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def load_dataset():

    print("Loading dataset...")

    df = pd.read_csv(DATASET_PATH)

    print(f"Original dataset size: {len(df)}")

    # Fill missing subjects
    df["subject"] = df["subject"].fillna("")

    # Fill missing messages
    df["message"] = df["message"].fillna("")

    # Combine subject + message
    df["text"] = (
        df["subject"].astype(str)
        + " "
        + df["message"].astype(str)
    )

    # Clean text
    df["text"] = df["text"].apply(clean_text)

    # Remove empty rows
    df = df[df["text"].str.len() > 0]

    # Remove duplicates
    df = df.drop_duplicates(subset=["text"])

    # Make sure label is integer
    df["label"] = df["label"].astype(int)

    print(f"Final dataset size: {len(df)}")

    print("\nClass distribution:")
    print(df["label"].value_counts())

    return df


def split_dataset():

    df = load_dataset()

    X = df["text"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    print("\nTrain samples:", len(X_train))
    print("Test samples :", len(X_test))

    return X_train, X_test, y_train, y_test


def evaluate_model(model_name, y_test, predictions):

    accuracy = accuracy_score(y_test, predictions) * 100

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    ) * 100

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    ) * 100

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    ) * 100

    print("\n" + "=" * 60)
    print(model_name)
    print("=" * 60)

    print(f"Accuracy  : {accuracy:.2f}%")
    print(f"Precision : {precision:.2f}%")
    print(f"Recall    : {recall:.2f}%")
    print(f"F1 Score  : {f1:.2f}%")

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            target_names=["Safe", "Phishing"],
            zero_division=0
        )
    )

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))

    # Save result
    result = pd.DataFrame([{
        "Model": model_name,
        "Accuracy (%)": round(accuracy, 2),
        "Precision (%)": round(precision, 2),
        "Recall (%)": round(recall, 2),
        "F1 (%)": round(f1, 2)
    }])

    result_file = os.path.join(
        RESULTS_DIR,
        "email_model_results.csv"
    )

    if os.path.exists(result_file):
        old_results = pd.read_csv(result_file)

        old_results = old_results[
            old_results["Model"] != model_name
        ]

        result = pd.concat(
            [old_results, result],
            ignore_index=True
        )

    result.to_csv(result_file, index=False)

    print(
        f"\nResults saved to: {result_file}"
    )

    return accuracy, precision, recall, f1