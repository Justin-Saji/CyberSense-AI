import os
import time
import joblib
import pandas as pd
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)


# ============================================================
# CONFIGURATION
# ============================================================

DATA_DIR = "url_dataset"
RESULT_DIR = "random_forest_reg08_results"

os.makedirs(RESULT_DIR, exist_ok=True)

TRAIN_FILE = os.path.join(DATA_DIR, "train.csv")
VAL_FILE = os.path.join(DATA_DIR, "validation.csv")
TEST_FILE = os.path.join(DATA_DIR, "test.csv")

RANDOM_STATE = 42


# ============================================================
# RF_REG_08 CONFIGURATION
# ============================================================

RF_CONFIG = {
    "n_estimators": 300,
    "max_depth": 8,
    "min_samples_split": 20,
    "min_samples_leaf": 5,
    "max_features": "log2",
    "bootstrap": True
}


# ============================================================
# TF-IDF CONFIGURATION
# ============================================================

TFIDF_CONFIG = {
    "analyzer": "char",
    "ngram_range": (2, 5),
    "max_features": 20000,
    "min_df": 1,
    "sublinear_tf": True,
    "dtype": np.float32
}


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("RF_REG_08 FINAL TEST EVALUATION")
print("=" * 70)

print("\nSelected configuration:")
print(f"Trees              : {RF_CONFIG['n_estimators']}")
print(f"Max Depth          : {RF_CONFIG['max_depth']}")
print(f"Min Samples Split  : {RF_CONFIG['min_samples_split']}")
print(f"Min Samples Leaf   : {RF_CONFIG['min_samples_leaf']}")
print(f"Max Features       : {RF_CONFIG['max_features']}")
print(f"Bootstrap           : {RF_CONFIG['bootstrap']}")

print("\nTF-IDF configuration:")
print(f"Analyzer            : {TFIDF_CONFIG['analyzer']}")
print(f"N-gram Range        : {TFIDF_CONFIG['ngram_range']}")
print(f"Max Features        : {TFIDF_CONFIG['max_features']}")


# ============================================================
# LOAD DATA
# ============================================================

print("\n" + "=" * 70)
print("LOADING DATA")
print("=" * 70)

train_df = pd.read_csv(TRAIN_FILE)
val_df = pd.read_csv(VAL_FILE)
test_df = pd.read_csv(TEST_FILE)

print(f"Train      : {train_df.shape}")
print(f"Validation : {val_df.shape}")
print(f"Test       : {test_df.shape}")

X_train_text = train_df["url"].astype(str)
y_train = train_df["label"].astype(int)

X_val_text = val_df["url"].astype(str)
y_val = val_df["label"].astype(int)

X_test_text = test_df["url"].astype(str)
y_test = test_df["label"].astype(int)


# ============================================================
# TF-IDF
# ============================================================

print("\n" + "=" * 70)
print("TF-IDF FEATURE EXTRACTION")
print("=" * 70)

print("\nFitting TF-IDF on training data only...")

vectorizer = TfidfVectorizer(**TFIDF_CONFIG)

X_train = vectorizer.fit_transform(X_train_text)

print(f"Training matrix: {X_train.shape}")

print("Transforming validation data...")
X_val = vectorizer.transform(X_val_text)

print("Transforming test data...")
X_test = vectorizer.transform(X_test_text)

print(f"Validation matrix: {X_val.shape}")
print(f"Test matrix      : {X_test.shape}")


# ============================================================
# TRAIN RF_REG_08
# ============================================================

print("\n" + "=" * 70)
print("TRAINING RF_REG_08")
print("=" * 70)

print("\nTraining Random Forest...")

start_time = time.time()

model = RandomForestClassifier(
    n_estimators=RF_CONFIG["n_estimators"],
    max_depth=RF_CONFIG["max_depth"],
    min_samples_split=RF_CONFIG["min_samples_split"],
    min_samples_leaf=RF_CONFIG["min_samples_leaf"],
    max_features=RF_CONFIG["max_features"],
    bootstrap=RF_CONFIG["bootstrap"],
    random_state=RANDOM_STATE,
    n_jobs=-1
)

model.fit(X_train, y_train)

training_time = time.time() - start_time

print(f"Training completed in {training_time:.2f} seconds.")


# ============================================================
# VALIDATION CHECK
# ============================================================

print("\n" + "=" * 70)
print("VALIDATION CHECK")
print("=" * 70)

y_val_pred = model.predict(X_val)

val_accuracy = accuracy_score(y_val, y_val_pred)
val_precision = precision_score(
    y_val,
    y_val_pred,
    zero_division=0
)
val_recall = recall_score(
    y_val,
    y_val_pred,
    zero_division=0
)
val_f1 = f1_score(
    y_val,
    y_val_pred,
    zero_division=0
)

print(f"Accuracy : {val_accuracy * 100:.2f}%")
print(f"Precision: {val_precision * 100:.2f}%")
print(f"Recall   : {val_recall * 100:.2f}%")
print(f"F1 Score : {val_f1 * 100:.2f}%")

print("\nValidation confusion matrix:")
print(confusion_matrix(y_val, y_val_pred))


# ============================================================
# FINAL TEST EVALUATION
# ============================================================

print("\n" + "=" * 70)
print("FINAL TEST EVALUATION")
print("=" * 70)

print("\nEvaluating RF_Reg_08 on the held-out test set...")

test_start = time.time()

y_test_pred = model.predict(X_test)

test_time = time.time() - test_start

test_accuracy = accuracy_score(y_test, y_test_pred)
test_precision = precision_score(
    y_test,
    y_test_pred,
    zero_division=0
)
test_recall = recall_score(
    y_test,
    y_test_pred,
    zero_division=0
)
test_f1 = f1_score(
    y_test,
    y_test_pred,
    zero_division=0
)

test_cm = confusion_matrix(y_test, y_test_pred)


# ============================================================
# PRINT RESULTS
# ============================================================

print("\n" + "=" * 70)
print("RF_REG_08 FINAL TEST RESULTS")
print("=" * 70)

print(f"\nAccuracy : {test_accuracy * 100:.2f}%")
print(f"Precision: {test_precision * 100:.2f}%")
print(f"Recall   : {test_recall * 100:.2f}%")
print(f"F1 Score : {test_f1 * 100:.2f}%")

print("\nConfusion Matrix:")
print(test_cm)

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_test_pred,
        target_names=["Legitimate", "Phishing"],
        digits=4,
        zero_division=0
    )
)

print(f"Test prediction time: {test_time:.4f} seconds")


# ============================================================
# SAVE RESULTS
# ============================================================

results = pd.DataFrame([{
    "experiment": "RF_Reg_08",
    "n_estimators": RF_CONFIG["n_estimators"],
    "max_depth": RF_CONFIG["max_depth"],
    "min_samples_split": RF_CONFIG["min_samples_split"],
    "min_samples_leaf": RF_CONFIG["min_samples_leaf"],
    "max_features": RF_CONFIG["max_features"],
    "bootstrap": RF_CONFIG["bootstrap"],

    "validation_accuracy": val_accuracy * 100,
    "validation_precision": val_precision * 100,
    "validation_recall": val_recall * 100,
    "validation_f1": val_f1 * 100,

    "test_accuracy": test_accuracy * 100,
    "test_precision": test_precision * 100,
    "test_recall": test_recall * 100,
    "test_f1": test_f1 * 100,

    "training_time_seconds": training_time,
    "test_prediction_time_seconds": test_time
}])

results_file = os.path.join(
    RESULT_DIR,
    "rf_reg08_test_results.csv"
)

results.to_csv(results_file, index=False)


# ============================================================
# SAVE MODEL AND VECTORIZER
# ============================================================

model_file = os.path.join(
    RESULT_DIR,
    "rf_reg08_model.pkl"
)

vectorizer_file = os.path.join(
    RESULT_DIR,
    "rf_reg08_tfidf_vectorizer.pkl"
)

joblib.dump(model, model_file)
joblib.dump(vectorizer, vectorizer_file)


# ============================================================
# COMPARISON WITH RF_REG_07
# ============================================================

print("\n" + "=" * 70)
print("RF_REG_07 vs RF_REG_08")
print("=" * 70)

comparison = pd.DataFrame([
    {
        "Model": "RF_Reg_07",
        "Validation F1": 100.00,
        "Test F1": 99.55
    },
    {
        "Model": "RF_Reg_08",
        "Validation F1": val_f1 * 100,
        "Test F1": test_f1 * 100
    }
])

print("\n")
print(comparison.to_string(index=False))

print("\n" + "=" * 70)
print("FILES SAVED")
print("=" * 70)

print(f"Results    : {results_file}")
print(f"Model      : {model_file}")
print(f"Vectorizer : {vectorizer_file}")

print("\nRF_Reg_08 test evaluation completed successfully.")