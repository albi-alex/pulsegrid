import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Conv1D, LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint


# ---------------------------------------
# 1. Load sequences
# ---------------------------------------

X_train = np.load("data/X_train.npy")
y_train = np.load("data/y_train.npy")

X_validation = np.load("data/X_validation.npy")
y_validation = np.load("data/y_validation.npy")


# ---------------------------------------
# 2. Display dataset shapes
# ---------------------------------------

print("Training data:")
print("X_train:", X_train.shape)
print("y_train:", y_train.shape)

print("\nValidation data:")
print("X_validation:", X_validation.shape)
print("y_validation:", y_validation.shape)


# ---------------------------------------
# 3. Get dimensions
# ---------------------------------------

timesteps = X_train.shape[1]
num_features = X_train.shape[2]
forecast_horizon = y_train.shape[1]


# ---------------------------------------
# 4. Build CNN-LSTM
# ---------------------------------------

model = Sequential([
    
    Input(
        shape=(timesteps, num_features)
    ),

    Conv1D(
        filters=32,
        kernel_size=3,
        activation="relu"
    ),

    Dropout(0.2),

    LSTM(64),

    Dropout(0.2),

    Dense(
        32,
        activation="relu"
    ),

    Dense(
        forecast_horizon
    )
])


# ---------------------------------------
# 5. Compile
# ---------------------------------------

model.compile(
    optimizer="adam",
    loss="mse",
    metrics=["mae"]
)


# ---------------------------------------
# 6. Callbacks
# ---------------------------------------

early_stopping = EarlyStopping(
    monitor="val_loss",
    patience=10,
    restore_best_weights=True
)

model_checkpoint = ModelCheckpoint(
    "models/best_cnn_lstm.keras",
    monitor="val_loss",
    save_best_only=True
)


# ---------------------------------------
# 7. Train
# ---------------------------------------

print("\nStarting training...\n")

history = model.fit(
    X_train,
    y_train,

    validation_data=(
        X_validation,
        y_validation
    ),

    epochs=100,

    batch_size=32,

    callbacks=[
        early_stopping,
        model_checkpoint
    ],

    verbose=1
)


# ---------------------------------------
# 8. Save final model
# ---------------------------------------

model.save(
    "models/cnn_lstm_final.keras"
)


# ---------------------------------------
# 9. Training summary
# ---------------------------------------

print("\nTraining complete!")

print(
    "Epochs actually trained:",
    len(history.history["loss"])
)

print(
    "Best validation loss:",
    min(history.history["val_loss"])
)

print(
    "Best validation MAE:",
    min(history.history["val_mae"])
)

print("\nSaved models:")
print("models/best_cnn_lstm.keras")
print("models/cnn_lstm_final.keras")