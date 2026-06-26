import json
from pathlib import Path

def merge_datasets():
    processed_dir = Path("backend/data/processed")
    master_file = Path("backend/data/interview_dataset.json")
    
    if not processed_dir.exists():
        print(f"Processed directory {processed_dir} does not exist.")
        return

    all_questions = []
    json_files = list(processed_dir.glob("*.json"))

    print("====================================================")
    print("           GetHire Dataset Compiler/Merger           ")
    print("====================================================")

    for filepath in json_files:
        if filepath.name == "interview_dataset.json":
            continue
            
        print(f"Reading questions from {filepath.name}...")
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            if isinstance(data, list):
                all_questions.extend(data)
                print(f"   -> Added {len(data)} questions.")
            else:
                print(f"   ⚠️ WARNING: {filepath.name} root element is not a list. Skipping.")
        except Exception as e:
            print(f"   🚨 ERROR: Failed to load {filepath.name}: {e}")

    # Save to master file
    with open(master_file, "w", encoding="utf-8") as out_f:
        json.dump(all_questions, out_f, indent=2)

    print("\n====================================================")
    print(f"🎉 SUCCESS: Merged {len(all_questions)} total questions into:")
    print(f"   -> {master_file.absolute()}")
    print("====================================================")

if __name__ == "__main__":
    merge_datasets()
