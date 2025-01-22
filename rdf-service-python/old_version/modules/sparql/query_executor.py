async def execute_query(session, endpoint, query):
    params = {"query": query, "format": "json"}
    headers = {"Accept": "application/sparql-results+json"}
    try:
        async with session.get(endpoint, params=params, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                if "results" in data and "bindings" in data["results"]:
                    print(f"[INFO] Results from {endpoint}: {len(data['results']['bindings'])} items")
                    return data["results"]["bindings"]
            print(f"[WARN] No valid results from {endpoint}")
            return []
    except Exception as e:
        print(f"[ERROR] Query failed for {endpoint}: {e}")
        return []