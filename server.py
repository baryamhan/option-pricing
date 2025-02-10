from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import math
from scipy.stats import norm

app = FastAPI()

# JSON dosyasını oku
def load_data():
    with open("data.json", "r") as file:
        return json.load(file)

# JSON dosyasını güncelle
def save_data(data):
    with open("data.json", "w") as file:
        json.dump(data, file, indent=4)

# Opsiyon fiyatlama için model
class OptionRequest(BaseModel):
    asset: str
    expiry_days: int
    strike: float
    spot_price: float
    option_type: str

# Admin paneli için model
class UpdateParams(BaseModel):
    asset: str
    volatility: float
    interest_rate: float

# Black-Scholes hesaplama fonksiyonu
def black_scholes(option_type, S, K, T, r, sigma):
    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)

    if option_type == "call":
        return S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
    elif option_type == "put":
        return K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
    else:
        raise ValueError("Option type must be 'call' or 'put'")

# Opsiyon fiyatlama endpoint'i
@app.post("/price_option")
def price_option(request: OptionRequest):
    data = load_data()

    if request.asset not in data["assets"]:
        raise HTTPException(status_code=400, detail="Geçersiz dayanak varlık")

    sigma = data["assets"][request.asset]
    r = data["interest_rate"] / 100
    T = request.expiry_days / 365

    try:
        price = black_scholes(request.option_type, request.spot_price, request.strike, T, r, sigma)
        return {"asset": request.asset, "price": price}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Admin güncelleme endpoint'i
@app.post("/update_parameters")
def update_parameters(params: UpdateParams):
    data = load_data()

    if params.asset not in data["assets"]:
        raise HTTPException(status_code=400, detail="Geçersiz dayanak varlık")

    data["assets"][params.asset] = params.volatility
    data["interest_rate"] = params.interest_rate

    save_data(data)
    return {"message": "Güncelleme başarılı!", "updated_data": data}
