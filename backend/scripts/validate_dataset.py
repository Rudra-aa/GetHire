import json
import argparse
import sys
from pathlib import Path
from pydantic import ValidationError
from backend.services.dataset_loader import DatasetQuestion

def validate_file(filepath: Path) -> tuple[bool, list[str], list[dict]]:
    errors = []
    valid_questions = []
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return False, [f"Failed to parse JSON file: {e}"], []

    questions_list = []
    if isinstance(data, list):
        questions_list = data
    elif isinstance(data, dict):
        if "questions" in data:
            questions_list = data["questions"]
        else:
            questions_list = [data]
    else:
        return False, ["Root element must be a list or a dictionary containing 'questions'."], []

    seen_ids = set()
    seen_texts = set()

    for idx, q_dict in enumerate(questions_list):
        q_id = q_dict.get('question_id', q_dict.get('id', 'unknown'))
        q_ref = f"Question index {idx} (ID: {q_id})"
        
        # Check basic schema validation
        try:
            # For parsing via DatasetQuestion, if q_dict contains id but not question_id, map it
            q_parse_dict = q_dict.copy()
            if "id" in q_parse_dict and "question_id" not in q_parse_dict:
                q_parse_dict["question_id"] = q_parse_dict.pop("id")
            if "domain" in q_parse_dict and "subject" not in q_parse_dict:
                q_parse_dict["subject"] = q_parse_dict.pop("domain")
            if "topic" in q_parse_dict and "category" not in q_parse_dict:
                q_parse_dict["category"] = q_parse_dict.pop("topic")
            if "explanation" in q_parse_dict and "ideal_answer" not in q_parse_dict:
                q_parse_dict["ideal_answer"] = q_parse_dict.pop("explanation")

            question = DatasetQuestion(**q_parse_dict)
            valid_questions.append(q_dict)
            
            # Check duplicate ID
            if question.id in seen_ids:
                errors.append(f"{q_ref}: Duplicate ID found: '{question.id}'")
            seen_ids.add(question.id)
            
            # Check duplicate Question text
            q_norm = question.question.lower().strip()
            if q_norm in seen_texts:
                errors.append(f"{q_ref}: Duplicate question text found.")
            seen_texts.add(q_norm)
            
            # Check difficulty values
            if question.difficulty.lower().strip() not in ["easy", "medium", "hard"]:
                errors.append(f"{q_ref}: Invalid difficulty level '{question.difficulty}'. Must be 'Easy', 'Medium', or 'Hard'")
                
        except ValidationError as ve:
            errors.append(f"{q_ref}: Schema validation failed: {ve}")
            
    is_valid = len(errors) == 0
    return is_valid, errors, valid_questions

def main():
    parser = argparse.ArgumentParser(description="Validate processed JSON datasets for GetHire schema compliance.")
    parser.add_argument("--dir", type=str, default="backend/data/processed", help="Directory containing processed JSON files")
    parser.add_argument("--file", type=str, help="Specific JSON file to validate")
    
    args = parser.parse_args()
    
    if args.file:
        files_to_validate = [Path(args.file)]
    else:
        processed_dir = Path(args.dir)
        if not processed_dir.exists():
            print(f"Directory {processed_dir} does not exist.")
            sys.exit(1)
        files_to_validate = list(processed_dir.glob("*.json"))
        
    if not files_to_validate:
        print("No JSON files found to validate.")
        sys.exit(0)

    all_passed = True
    total_questions = 0

    print("====================================================")
    print("           GetHire Dataset Schema Validator          ")
    print("====================================================")

    for filepath in files_to_validate:
        # Ignore master dataset when validating individual source files
        if filepath.name == "interview_dataset.json":
            continue
            
        print(f"\nValidating {filepath.name}...")
        is_valid, errors, valid_qs = validate_file(filepath)
        
        if is_valid:
            print(f"✅ PASSED: {len(valid_qs)} questions are compliant.")
            total_questions += len(valid_qs)
        else:
            print(f"❌ FAILED: Found {len(errors)} validation errors.")
            for err in errors[:10]:
                print(f"   - {err}")
            if len(errors) > 10:
                print(f"   - ... and {len(errors) - 10} more errors.")
            all_passed = False

    print("\n====================================================")
    if all_passed:
        print(f"🎉 SUCCESS: All datasets are valid! (Total questions: {total_questions})")
        sys.exit(0)
    else:
        print("🚨 FAILURE: One or more datasets have validation errors.")
        sys.exit(1)

if __name__ == "__main__":
    main()
