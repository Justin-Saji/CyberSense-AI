from sklearn.ensemble import RandomForestClassifier

from ml_common import (
    load_datasets,
    create_tfidf,
    evaluate_model
)


train_df, val_df, test_df = load_datasets()

vectorizer = create_tfidf()

X_train = vectorizer.fit_transform(train_df["url"])
X_val = vectorizer.transform(val_df["url"])
X_test = vectorizer.transform(test_df["url"])

y_train = train_df["label"]
y_val = val_df["label"]
y_test = test_df["label"]


model = RandomForestClassifier(
    n_estimators=200,
    max_depth=20,
    n_jobs=-1,
    random_state=42
)

model.fit(X_train, y_train)

print("\nVALIDATION RESULTS")
evaluate_model(model, X_val, y_val)

print("\nTEST RESULTS")
evaluate_model(model, X_test, y_test)