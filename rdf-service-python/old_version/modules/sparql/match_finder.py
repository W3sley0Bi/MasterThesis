from difflib import SequenceMatcher

def find_best_match(results, term):
    best_match, best_score = None, 0
    for result in results:
        label = result.get("classLabel", {}).get("value", "") or result.get("entityLabel", {}).get("value", "")
        if not label:
            continue
        score = SequenceMatcher(None, label.lower(), term.lower()).ratio()
        if score > best_score:
            best_match, best_score = result, score
    print(f"[INFO] Best match score: {best_score}")
    return best_match