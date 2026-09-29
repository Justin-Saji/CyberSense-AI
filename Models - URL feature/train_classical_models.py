import os
import time
import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer

from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestClassifier,
    VotingClassifier
)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

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
MODEL_DIR = "trained_models"

os.makedirs(MODEL_DIR, exist_ok=True)

# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("LOADING DATA")
print("=" * 70)

train_df = pd.read_csv(
    os.path.join(DATA_DIR, "train.csv")
)

validation_df = pd.read_csv(
    os.path.join(DATA_DIR, "validation.csv")
)

test_df = pd.read_csv(
    os.path.join(DATA_DIR, "test.csv")
)

X_train_text = train_df["URL"].astype(str)
y_train = train_df["label"]

X_validation_text = validation_df["URL"].astype(str)
y_validation = validation_df["label"]

X_test_text = test_df["URL"].astype(str)
y_test = test_df["label"]

# ============================================================
# TF-IDF CHARACTER REPRESENTATION
# ============================================================

print("\nCreating TF-IDF representation...")

vectorizer = TfidfVectorizer(
    analyzer="char",
    ngram_range=(2, 5),
    min_df=2,
    max_features=200000,
    sublinear_tf=True
)

X_train = vectorizer.fit_transform(X_train_text)

X_validation = vectorizer.transform(
    X_validation_text
)

X_test = vectorizer.transform(
    X_test_text
)

print("Training matrix:", X_train.shape)
print("Validation matrix:", X_validation.shape)
print("Test matrix:", X_test.shape)

joblib.dump(
    vectorizer,
    os.path.join(MODEL_DIR, "url_tfidf_vectorizer.pkl")
)

# ============================================================
# MODELS
# ============================================================

models = {

    "Logistic Regression":
        LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        ),

    "Naive Bayes":
        MultinomialNB(),

    "Linear SVM":
        LinearSVC(
            class_weight="balanced",
            random_state=42
        ),

    "Decision Tree":
        DecisionTreeClassifier(
            max_depth=30,
            class_weight="balanced",
            random_state=42
        ),

    "Random Forest":
        RandomForestClassifier(
            n_estimators=200,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        ),

    "KNN":
        KNeighborsClassifier(
            n_neighbors=5,
            n_jobs=-1
        ),

    "MLP":
        MLPClassifier(
            hidden_layer_sizes=(128, 64),
            max_iter=30,
            early_stopping=True,
            random_state=42
        )
}

# ============================================================
# TRAIN + EVALUATE
# ============================================================

results = []

for name, model in models.items():

    print("\n" + "=" * 70)
    print(f"TRAINING: {name}")
    print("=" * 70)

    start_time = time.time()

    model.fit(
        X_train,
        y_train
    )

    training_time = time.time() - start_time

    # Validation prediction
    validation_pred = model.predict(
        X_validation
    )

    # Test prediction
    test_pred = model.predict(
        X_test
    )

    # Validation metrics
    val_accuracy = accuracy_score(
        y_validation,
        validation_pred
    )

    val_precision = precision_score(
        y_validation,
        validation_pred,
        zero_division=0
    )

    val_recall = recall_score(
        y_validation,
        validation_pred,
        zero_division=0
    )

    val_f1 = f1_score(
        y_validation,
        validation_pred,
        zero_division=0
    )

    # Test metrics
    test_accuracy = accuracy_score(
        y_test,
        test_pred
    )

    test_precision = precision_score(
        y_test,
        test_pred,
        zero_division=0
    )

    test_recall = recall_score(
        y_test,
        test_pred,
        zero_division=0
    )

    test_f1 = f1_score(
        y_test,
        test_pred,
        zero_division=0
    )

    print("\nValidation Results")
    print("-" * 40)
    print(f"Accuracy : {val_accuracy * 100:.2f}%")
    print(f"Precision: {val_precision * 100:.2f}%")
    print(f"Recall   : {val_recall * 100:.2f}%")
    print(f"F1 Score : {val_f1 * 100:.2f}%")

    print("\nTest Results")
    print("-" * 40)
    print(f"Accuracy : {test_accuracy * 100:.2f}%")
    print(f"Precision: {test_precision * 100:.2f}%")
    print(f"Recall   : {test_recall * 100:.2f}%")
    print(f"F1 Score : {test_f1 * 100:.2f}%")

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            test_pred,
            target_names=[
                "Legitimate",
                "Phishing"
            ],
            zero_division=0
        )
    )

    print("\nConfusion Matrix:")
    print(
        confusion_matrix(
            y_test,
            test_pred
        )
    )

    print(
        f"\nTraining time: {training_time:.2f} seconds"
    )

    # Save model
    filename = (
        name.lower()
        .replace(" ", "_")
        + ".pkl"
    )

    joblib.dump(
        model,
        os.path.join(
            MODEL_DIR,
            filename
        )
    )

    results.append({
        "Model": name,

        "Validation Accuracy":
            val_accuracy,

        "Validation Precision":
            val_precision,

        "Validation Recall":
            val_recall,

        "Validation F1":
            val_f1,

        "Test Accuracy":
            test_accuracy,

        "Test Precision":
            test_precision,

        "Test Recall":
            test_recall,

        "Test F1":
            test_f1,

        "Training Time":
            training_time
    })


# ============================================================
# RESULTS TABLE
# ============================================================

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    "Validation F1",
    ascending=False
)

results_df.to_csv(
    "classical_model_results.csv",
    index=False
)

print("\n" + "=" * 70)
print("CLASSICAL ML COMPARISON")
print("=" * 70)

print(
    results_df.to_string(index=False)
)

print("\nResults saved to:")
print("classical_model_results.csv")