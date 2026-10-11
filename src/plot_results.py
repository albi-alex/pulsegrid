import numpy as np
import joblib
import tensorflow as tf
import matplotlib.pyplot as plt

from sklearn.metrics import mean_absolute_error


# --------------------------------------------------
# 1. Load test data and model
# --------------------------------------------------

X_test = np.load("data/X_test.npy")
y_test = np.load("data/y_test.npy")

model = tf.keras.models.load_model(
    "models/best_cnn_lstm.keras"
)

target_scaler = joblib.load(
    "models/target_scaler.pkl"
)


# --------------------------------------------------
# 2. Generate predictions
# --------------------------------------------------

y_pred = model.predict(
    X_test,
    verbose=0
)


# --------------------------------------------------
# 3. Convert back to watts
# --------------------------------------------------

y_test_original = target_scaler.inverse_transform(
    y_test.reshape(-1, 1)
).reshape(y_test.shape)

y_pred_original = target_scaler.inverse_transform(
    y_pred.reshape(-1, 1)
).reshape(y_pred.shape)


# --------------------------------------------------
# 4. Plot one complete 4-hour forecast
# --------------------------------------------------

actual = y_test_original[0]
predicted = y_pred_original[0]

time_steps = np.arange(1, 17)

plt.figure(figsize=(10, 5))

plt.plot(
    time_steps,
    actual,
    marker="o",
    label="Actual Power"
)

plt.plot(
    time_steps,
    predicted,
    marker="o",
    label="Predicted Power"
)

plt.xlabel("Forecast Step (15 minutes)")
plt.ylabel("AC Power (W)")
plt.title("CNN-LSTM 4-Hour Solar Power Forecast")

plt.xticks(time_steps)
plt.grid(True)
plt.legend()

plt.tight_layout()

plt.savefig(
    "plots/4_hour_forecast.png",
    dpi=300
)

plt.show()


# --------------------------------------------------
# 5. Calculate error for each forecast step
# --------------------------------------------------

step_mae = []

for i in range(16):

    mae = mean_absolute_error(
        y_test_original[:, i],
        y_pred_original[:, i]
    )

    step_mae.append(mae)


# --------------------------------------------------
# 6. Plot MAE by forecast horizon
# --------------------------------------------------

forecast_minutes = np.arange(15, 241, 15)

plt.figure(figsize=(10, 5))

plt.plot(
    forecast_minutes,
    step_mae,
    marker="o"
)

plt.xlabel("Forecast Horizon (minutes)")
plt.ylabel("MAE (W)")
plt.title("CNN-LSTM Error Across 4-Hour Forecast Horizon")

plt.grid(True)

plt.tight_layout()

plt.savefig(
    "plots/horizon_mae.png",
    dpi=300
)

plt.show()


# --------------------------------------------------
# 7. Print horizon errors
# --------------------------------------------------

print("\nMAE by forecast step:")
print("-" * 40)

for i, mae in enumerate(step_mae):

    print(
        f"{(i + 1) * 15:3d} minutes: "
        f"{mae:.2f} W"
    )

print("\nPlots saved:")
print("plots/4_hour_forecast.png")
print("plots/horizon_mae.png")