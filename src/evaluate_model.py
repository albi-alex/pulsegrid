import numpy as np
import joblib
import tensorflow as tf

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# --------------------------------------------------
# 1. Load test data
# --------------------------------------------------

X_test = np.load("data/X_test.npy")
y_test = np.load("data/y_test.npy")

print("Test data:")
print("X_test:", X_test.shape)
print("y_test:", y_test.shape)


# --------------------------------------------------
# 2. Load trained model
# --------------------------------------------------

model = tf.keras.models.load_model(
    "models/best_cnn_lstm.keras"
)

print("\nModel loaded successfully.")


# --------------------------------------------------
# 3. Generate predictions
# --------------------------------------------------

y_pred = model.predict(X_test, verbose=0)

print("\nPrediction shape:")
print("y_pred:", y_pred.shape)


# --------------------------------------------------
# 4. Load target scaler
# --------------------------------------------------

target_scaler = joblib.load(
    "models/target_scaler.pkl"
)


# --------------------------------------------------
# 5. Convert scaled values back to watts
# --------------------------------------------------

y_test_original = target_scaler.inverse_transform(
    y_test.reshape(-1, 1)
).reshape(y_test.shape)

y_pred_original = target_scaler.inverse_transform(
    y_pred.reshape(-1, 1)
).reshape(y_pred.shape)


# --------------------------------------------------
# 6. Flatten all 16 forecast steps
# --------------------------------------------------

actual = y_test_original.flatten()
predicted = y_pred_original.flatten()


# --------------------------------------------------
# 7. Calculate metrics
# --------------------------------------------------

mae = mean_absolute_error(
    actual,
    predicted
)

rmse = np.sqrt(
    mean_squared_error(
        actual,
        predicted
    )
)

r2 = r2_score(
    actual,
    predicted
)


# --------------------------------------------------
# 8. Display results
# --------------------------------------------------

print("\n" + "=" * 50)
print("CNN-LSTM TEST RESULTS")
print("=" * 50)

print(f"MAE  : {mae:.2f} W")
print(f"RMSE : {rmse:.2f} W")
print(f"R²   : {r2:.4f}")

print("=" * 50)


# --------------------------------------------------
# 9. Show one example forecast
# --------------------------------------------------

print("\nExample 4-hour forecast:")
print("-" * 50)

for i in range(16):
    print(
        f"Step {i + 1:2d}: "
        f"Actual = {y_test_original[0, i]:8.2f} W   "
        f"Predicted = {y_pred_original[0, i]:8.2f} W"
    )