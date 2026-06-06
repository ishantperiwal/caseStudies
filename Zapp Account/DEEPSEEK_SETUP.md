# DeepSeek local setup (global for VS Code)

1. Ensure your API key is stored as a Windows user environment variable so it's available in every VS Code project:

PowerShell (persist):

```powershell
setx DEEPSEEK_API_KEY "your_api_key_here"
```

Restart VS Code after running `setx` so new terminals pick up the value.

2. Optional: set a custom API URL in `DEEPSEEK_API_URL` if you have a different endpoint.

3. Optional: choose a model explicitly instead of letting the server use an automatic model selection. Set `DEEPSEEK_MODEL` to the model name you want to use (e.g. `small-embed`, `text-search-v1`). The example scripts will include this value in the request payload when present.

4. Examples are in the `examples` folder:

- `examples/deepseek_test.py` — prints sample curl and can perform a request when `DEEPSEEK_PERFORM_REQUEST=1`.
- `examples/deepseek_test.js` — same behavior for Node (uses `node-fetch` if necessary).

Run the examples:

PowerShell / CMD:

```powershell
# Python
python .\examples\deepseek_test.py

# Node
node .\examples\deepseek_test.js
```

To let the script actually perform an HTTP request (live) set an extra env var in the same terminal session:

PowerShell temporary:

```powershell
$env:DEEPSEEK_PERFORM_REQUEST = "1"
python .\examples\deepseek_test.py
```

If you want me to run one of these here to verify, tell me which example and whether I should perform the live request (I cannot access private API keys for you). Replace the placeholder endpoint in the examples with the real DeepSeek URL if you have it.
