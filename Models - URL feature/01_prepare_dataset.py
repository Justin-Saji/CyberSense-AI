import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

INPUT_FILE = "phishing_site_urls.xlsx"
OUTPUT_DIR = "url_dataset"

RANDOM_STATE = 42

# ============================================================
# CONFIGURATION
# ============================================================

# Set to None to use the complete cleaned dataset.
# Example: 20000 for a faster initial experiment.
MAX_SAMPLES = None

# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("Loading dataset...")
print("=" * 70)

df = pd.read_excel(INPUT_FILE)

print("Original shape:", df.shape)
print("Columns:", df.columns.tolist())

# ============================================================
# KEEP REQUIRED COLUMNS
# ============================================================

df = df[["URL", "Label"]].copy()

# Remove missing values
df = df.dropna(subset=["URL", "Label"])

# Convert URL to string
df["URL"] = df["URL"].astype(str).str.strip()

# Remove empty URLs
df = df[df["URL"] != ""]

# Normalize labels
df["Label"] = df["Label"].astype(str).str.lower().str.strip()

label_mapping = {
    "good": 0,
    "bad": 1
}

df["label"] = df["Label"].map(label_mapping)

# Remove unknown labels
df = df.dropna(subset=["label"])

df["label"] = df["label"].astype(int)

# ============================================================
# REMOVE DUPLICATE URLS
# ============================================================

before = len(df)

df = df.drop_duplicates(
    subset=["URL"],
    keep="first"
)

after = len(df)

print(f"Removed duplicate URLs: {before - after}")

# ============================================================
# OPTIONAL SUBSAMPLING
# ============================================================

if MAX_SAMPLES is not None and len(df) > MAX_SAMPLES:

    print(f"\nCreating balanced subset of {MAX_SAMPLES} records...")

    samples_per_class = MAX_SAMPLES // 2

    good = df[df["label"] == 0].sample(
        n=samples_per_class,
        random_state=RANDOM_STATE
    )

    bad = df[df["label"] == 1].sample(
        n=samples_per_class,
        random_state=RANDOM_STATE
    )

    df = pd.concat([good, bad])

    df = df.sample(
        frac=1,
        random_state=RANDOM_STATE
    ).reset_index(drop=True)

# ============================================================
# DISPLAY DISTRIBUTION
# ============================================================

print("\nFinal dataset:")
print(df["label"].value_counts())

print("\nClass percentages:")
print(df["label"].value_counts(normalize=True) * 100)

# ============================================================
# TRAIN / VALIDATION / TEST
# ============================================================

train_df, temp_df = train_test_split(
    df,
    test_size=0.20,
    stratify=df["label"],
    random_state=RANDOM_STATE
)

val_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    stratify=temp_df["label"],
    random_state=RANDOM_STATE
)

# ============================================================
# SAVE
# ============================================================

os.makedirs(OUTPUT_DIR, exist_ok=True)

train_df.to_csv(
    os.path.join(OUTPUT_DIR, "train.csv"),
    index=False
)

val_df.to_csv(
    os.path.join(OUTPUT_DIR, "validation.csv"),
    index=False
)

test_df.to_csv(
    os.path.join(OUTPUT_DIR, "test.csv"),
    index=False
)

print("\n" + "=" * 70)
print("DATASET PREPARATION COMPLETE")
print("=" * 70)

print("Train:", len(train_df))
print("Validation:", len(val_df))
print("Test:", len(test_df))

print("\nFiles created:")
print("url_dataset/train.csv")
print("url_dataset/validation.csv")
print("url_dataset/test.csv")