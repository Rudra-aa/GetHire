import asyncio
from dotenv import load_dotenv
load_dotenv()
from app.providers.gemini import gemini_provider

async def test_gemini():
    print("Starting gemini test...")
    res = await gemini_provider.generate(
        prompt="Hello, this is a test.",
        system_instruction="You are a helpful AI.",
        temperature=0.7,
        max_tokens=256,
        response_format="text"
    )
    print("Response:")
    print(res)

if __name__ == "__main__":
    asyncio.run(test_gemini())
