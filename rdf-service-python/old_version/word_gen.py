import requests

def get_isa_relations(word):

    word_formatted = word.lower().replace(" ", "_")

    url = f"https://api.conceptnet.io/query?end=/c/en/{word_formatted}&rel=/r/IsA"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        # Extract `IsA` relationships
        isa_relations = [
            edge['start']['label']
            for edge in data.get('edges', [])
            if edge['rel']['label'] == 'IsA'
        ]

        return isa_relations

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while fetching data: {e}")
        return []

# Example usage
if __name__ == "__main__":
    input_word = input("Enter a word to find its 'IsA' relationships: ")
    results = get_isa_relations(input_word)

    print(f"\n'{input_word}' is related to the following terms via 'IsA':")
    for relation in results:
        print(f"- {relation}")
