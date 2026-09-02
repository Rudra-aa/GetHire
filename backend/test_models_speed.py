import asyncio
import time
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
load_dotenv("../.env")

api_key = os.getenv("GEMINI_API_KEY", "")
genai.configure(api_key=api_key, transport="rest")

models_to_test = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.5-flash", "gemini-3.6-flash"]

for m in models_to_test:
    print(f"Testing model: {m}...")
    t0 = time.time()
    try:
        model = genai.GenerativeModel(m)
        res = model.generate_content("Say hello in one sentence.", request_options={"timeout": 5.0})
        t1 = time.time()
        print(f"  SUCCESS! Time: {t1-t0:.2f}s | Response: {res.text.strip()}")
    except Exception as e:
        t1 = time.time()
        print(f"  FAILED! Time: {t1-t0:.2f}s | Error: {e}")
