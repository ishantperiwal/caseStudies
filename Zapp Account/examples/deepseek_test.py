import os
import json
import sys

KEY = os.environ.get("DEEPSEEK_API_KEY")
URL = os.environ.get("DEEPSEEK_API_URL", "https://api.deepseek.example/v1/search")

if not KEY:
    print("ERROR: DEEPSEEK_API_KEY is not set. Set it globally or in this terminal.")
    sys.exit(1)

print(f"DEEPSEEK_API_URL={URL}")
print("DEEPSEEK_API_KEY found in environment (hidden)")

sample_payload = {"query": "test"}
model = os.environ.get("DEEPSEEK_MODEL")
if model:
    sample_payload["model"] = model

print("\nSample curl command to run:\n")
print(
    (
        f"curl -H \"Authorization: Bearer $DEEPSEEK_API_KEY\" -H \"Content-Type: application/json\" "
        f"-X POST \"{URL}\" -d '{json.dumps(sample_payload)}'"
    )
)

if os.environ.get("DEEPSEEK_PERFORM_REQUEST") == "1":
    try:
        import requests
    except Exception:
        print("requests not installed. Install with: pip install requests")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}
    resp = requests.post(URL, headers=headers, json=sample_payload)
    print("\nHTTP", resp.status_code)
    try:
        print(resp.json())
    except Exception:
        print(resp.text)
