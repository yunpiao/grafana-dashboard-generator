#!/usr/bin/env python3
"""
Classify Kaggle writeups using LLM.

Stage 1: Sample 200-300 writeups, ask LLM to infer categories.
Stage 2: Classify all writeups using the inferred categories.

Usage:
  # Stage 1: Infer categories from sample
  python classify_writeups.py infer --csv writeups.csv --out categories.json

  # Stage 2: Classify all writeups
  python classify_writeups.py classify --csv writeups.csv --categories categories.json --out writeups_classified.csv

Environment variables:
  LLM_API_KEY      - API key (required)
  LLM_BASE_URL     - Base URL (default: https://api.openai.com/v1)
  LLM_MODEL        - Model name (default: gpt-4o-mini)
"""

import argparse
import csv
import json
import os
import random
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

# ---------------------------------------------------------------------------
# LLM Client (fetch-based, edge-friendly)
# ---------------------------------------------------------------------------

def llm_chat(
    messages: List[Dict[str, str]],
    *,
    api_key: str,
    base_url: str = "https://api.openai.com/v1",
    model: str = "gpt-4o-mini",
    temperature: float = 0.3,
    max_tokens: int = 4096,
    max_retries: int = 5,
) -> str:
    """Call LLM chat completion API, return assistant message content."""
    import urllib.request
    import urllib.error

    url = f"{base_url.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    for attempt in range(1, max_retries + 1):
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = min(60, 2 ** attempt)
                print(f"[llm] rate limited, retry {attempt}/{max_retries} after {wait}s", file=sys.stderr)
                time.sleep(wait)
                continue
            raise
        except Exception as e:
            if attempt < max_retries:
                wait = min(30, 2 ** attempt)
                print(f"[llm] error {e}, retry {attempt}/{max_retries} after {wait}s", file=sys.stderr)
                time.sleep(wait)
                continue
            raise

    raise RuntimeError("LLM call failed after retries")


# ---------------------------------------------------------------------------
# Stage 1: Infer categories from sample
# ---------------------------------------------------------------------------

INFER_SYSTEM_PROMPT = """You are an expert at categorizing software/AI projects.

Given a list of project titles and descriptions, analyze them and propose a category taxonomy.

Requirements:
1. Create 10-25 top-level categories that cover all projects
2. Categories should be mutually exclusive and collectively exhaustive
3. Each category should have a clear, concise name (2-4 words)
4. Categories should be meaningful for understanding project types

Output format (JSON):
{
  "categories": [
    {
      "name": "Health & Fitness",
      "description": "Apps for health tracking, fitness, nutrition, medical assistance",
      "example_keywords": ["health", "fitness", "nutrition", "medical", "workout"]
    },
    ...
  ]
}
"""

MERGE_CATEGORIES_PROMPT = """You are an expert at categorizing software/AI projects.

You have been given category suggestions from multiple batches of projects. 
Merge and consolidate them into a final unified taxonomy.

Requirements:
1. Create 15-25 top-level categories that cover all projects
2. Merge similar/overlapping categories
3. Keep categories mutually exclusive and collectively exhaustive
4. Each category should have a clear, concise name (2-4 words)

Output format (JSON):
{
  "categories": [
    {
      "name": "Health & Fitness",
      "description": "Apps for health tracking, fitness, nutrition, medical assistance",
      "example_keywords": ["health", "fitness", "nutrition", "medical", "workout"]
    },
    ...
  ]
}
"""

def infer_categories(
    samples: List[Dict[str, str]],
    *,
    api_key: str,
    base_url: str,
    model: str,
) -> Dict[str, Any]:
    """Use LLM to infer categories from sample projects."""

    # Format samples for LLM
    sample_text = "\n".join(
        f"- **{s['title']}**: {s['description']}"
        for s in samples
    )

    messages = [
        {"role": "system", "content": INFER_SYSTEM_PROMPT},
        {"role": "user", "content": f"Analyze these {len(samples)} projects and propose a category taxonomy:\n\n{sample_text}"},
    ]

    response = llm_chat(
        messages,
        api_key=api_key,
        base_url=base_url,
        model=model,
        temperature=0.3,
        max_tokens=4096,
    )

    # Parse JSON from response
    # Try to extract JSON block if wrapped in markdown
    if "```json" in response:
        start = response.find("```json") + 7
        end = response.find("```", start)
        response = response[start:end].strip()
    elif "```" in response:
        start = response.find("```") + 3
        end = response.find("```", start)
        response = response[start:end].strip()

    return json.loads(response)


def cmd_infer(args: argparse.Namespace) -> None:
    """Stage 1: Infer categories from sample or full dataset."""
    api_key = os.environ.get("LLM_API_KEY", "")
    base_url = os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1")
    model = os.environ.get("LLM_MODEL", "gpt-4o-mini")

    if not api_key:
        print("Error: LLM_API_KEY environment variable is required", file=sys.stderr)
        sys.exit(1)

    csv_path = Path(args.csv)
    out_path = Path(args.out)
    batch_size = args.batch_size
    use_all = args.all

    # Read CSV
    with csv_path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Loaded {len(rows)} writeups from {csv_path}")

    # Prepare all data
    all_data = [
        {"title": r.get("title", ""), "description": r.get("description", "")}
        for r in rows
    ]

    if use_all:
        # Full dataset mode: process in batches, then merge
        print(f"Processing ALL {len(all_data)} writeups in batches of {batch_size}")
        
        batch_categories = []
        total_batches = (len(all_data) + batch_size - 1) // batch_size
        
        for i in range(0, len(all_data), batch_size):
            batch = all_data[i:i + batch_size]
            batch_num = i // batch_size + 1
            print(f"[{batch_num}/{total_batches}] Inferring categories from {len(batch)} writeups...", end=" ", flush=True)
            
            try:
                result = infer_categories(
                    batch,
                    api_key=api_key,
                    base_url=base_url,
                    model=model,
                )
                cats = result.get("categories", [])
                batch_categories.extend(cats)
                print(f"found {len(cats)} categories")
            except Exception as e:
                print(f"ERROR: {e}")
            
            time.sleep(1)  # Rate limit
        
        print(f"\nCollected {len(batch_categories)} category suggestions from {total_batches} batches")
        print("Merging categories...")
        
        # Merge all batch categories
        result = merge_categories(
            batch_categories,
            api_key=api_key,
            base_url=base_url,
            model=model,
        )
    else:
        # Sample mode
        sample_size = args.sample_size
        if len(all_data) > sample_size:
            samples = random.sample(all_data, sample_size)
        else:
            samples = all_data
        
        print(f"Sampling {len(samples)} writeups for category inference")
        print(f"Calling LLM ({model}) to infer categories...")
        
        result = infer_categories(
            samples,
            api_key=api_key,
            base_url=base_url,
            model=model,
        )

    # Save result
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\nInferred {len(result.get('categories', []))} categories:")
    for cat in result.get("categories", []):
        print(f"  - {cat['name']}: {cat.get('description', '')}")

    print(f"\nSaved to {out_path}")
    print("\nReview and edit the categories, then run Stage 2:")
    print(f"  python {sys.argv[0]} classify --csv {csv_path} --categories {out_path} --out writeups_classified.csv")


def merge_categories(
    batch_categories: List[Dict[str, Any]],
    *,
    api_key: str,
    base_url: str,
    model: str,
) -> Dict[str, Any]:
    """Merge category suggestions from multiple batches."""
    
    # Format batch categories for LLM
    cat_text = "\n".join(
        f"- {c.get('name', 'Unknown')}: {c.get('description', '')}"
        for c in batch_categories
    )
    
    messages = [
        {"role": "system", "content": MERGE_CATEGORIES_PROMPT},
        {"role": "user", "content": f"Merge these {len(batch_categories)} category suggestions into a unified taxonomy:\n\n{cat_text}"},
    ]
    
    response = llm_chat(
        messages,
        api_key=api_key,
        base_url=base_url,
        model=model,
        temperature=0.3,
        max_tokens=4096,
    )
    
    # Parse JSON from response
    if "```json" in response:
        start = response.find("```json") + 7
        end = response.find("```", start)
        response = response[start:end].strip()
    elif "```" in response:
        start = response.find("```") + 3
        end = response.find("```", start)
        response = response[start:end].strip()
    
    return json.loads(response)


# ---------------------------------------------------------------------------
# Stage 2: Classify all writeups
# ---------------------------------------------------------------------------

CLASSIFY_SYSTEM_PROMPT_TEMPLATE = """You are an expert at categorizing software/AI projects.

Classify each project into exactly ONE of these categories:
{categories}

For each project, output a JSON object with:
- "id": the project ID
- "category": the category name (must be exactly one of the listed categories)
- "confidence": confidence level (high/medium/low)

Output format (JSON array):
[
  {{"id": "12345", "category": "Health & Fitness", "confidence": "high"}},
  ...
]
"""

def classify_batch(
    batch: List[Dict[str, str]],
    categories: List[Dict[str, str]],
    *,
    api_key: str,
    base_url: str,
    model: str,
) -> List[Dict[str, str]]:
    """Classify a batch of projects using LLM."""

    cat_list = "\n".join(f"- {c['name']}: {c.get('description', '')}" for c in categories)
    system_prompt = CLASSIFY_SYSTEM_PROMPT_TEMPLATE.format(categories=cat_list)

    batch_text = "\n".join(
        f"ID={b['id']} | Title: {b['title']} | Description: {b['description']}"
        for b in batch
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Classify these {len(batch)} projects:\n\n{batch_text}"},
    ]

    response = llm_chat(
        messages,
        api_key=api_key,
        base_url=base_url,
        model=model,
        temperature=0.1,
        max_tokens=4096,
    )

    # Parse JSON from response
    if "```json" in response:
        start = response.find("```json") + 7
        end = response.find("```", start)
        response = response[start:end].strip()
    elif "```" in response:
        start = response.find("```") + 3
        end = response.find("```", start)
        response = response[start:end].strip()

    return json.loads(response)


def cmd_classify(args: argparse.Namespace) -> None:
    """Stage 2: Classify all writeups."""
    api_key = os.environ.get("LLM_API_KEY", "")
    base_url = os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1")
    model = os.environ.get("LLM_MODEL", "gpt-4o-mini")

    if not api_key:
        print("Error: LLM_API_KEY environment variable is required", file=sys.stderr)
        sys.exit(1)

    csv_path = Path(args.csv)
    categories_path = Path(args.categories)
    out_path = Path(args.out)
    batch_size = args.batch_size

    # Load categories
    with categories_path.open("r", encoding="utf-8") as f:
        cat_data = json.load(f)
    categories = cat_data.get("categories", [])
    print(f"Loaded {len(categories)} categories from {categories_path}")

    # Read CSV
    with csv_path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        rows = list(reader)

    print(f"Loaded {len(rows)} writeups from {csv_path}")

    # Classify in batches
    results = {}  # id -> {"category": ..., "confidence": ...}
    total_batches = (len(rows) + batch_size - 1) // batch_size

    for i in range(0, len(rows), batch_size):
        batch_rows = rows[i:i + batch_size]
        batch_num = i // batch_size + 1

        batch_data = [
            {
                "id": r.get("writeup_id", ""),
                "title": r.get("title", ""),
                "description": r.get("description", ""),
            }
            for r in batch_rows
        ]

        print(f"[{batch_num}/{total_batches}] Classifying {len(batch_data)} writeups...", end=" ", flush=True)

        try:
            batch_results = classify_batch(
                batch_data,
                categories,
                api_key=api_key,
                base_url=base_url,
                model=model,
            )
            for item in batch_results:
                results[str(item["id"])] = {
                    "category": item.get("category", "Unknown"),
                    "confidence": item.get("confidence", "low"),
                }
            print("OK")
        except Exception as e:
            print(f"ERROR: {e}")
            # Mark batch as failed
            for r in batch_rows:
                wid = r.get("writeup_id", "")
                if wid not in results:
                    results[wid] = {"category": "ERROR", "confidence": "low"}

        # Small delay between batches
        time.sleep(0.5)

    # Write output CSV
    out_fieldnames = list(fieldnames) + ["category", "confidence"]
    with out_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=out_fieldnames)
        writer.writeheader()
        for row in rows:
            wid = row.get("writeup_id", "")
            cat_info = results.get(wid, {"category": "Unknown", "confidence": "low"})
            row["category"] = cat_info["category"]
            row["confidence"] = cat_info["confidence"]
            writer.writerow(row)

    print(f"\nClassified {len(rows)} writeups")
    print(f"Saved to {out_path}")

    # Summary
    cat_counts = {}
    for r in results.values():
        c = r["category"]
        cat_counts[c] = cat_counts.get(c, 0) + 1

    print("\nCategory distribution:")
    for c, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {c}: {cnt}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Classify Kaggle writeups using LLM")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # infer command
    infer_parser = subparsers.add_parser("infer", help="Infer categories from sample or full dataset")
    infer_parser.add_argument("--csv", required=True, help="Input CSV file")
    infer_parser.add_argument("--out", default="categories.json", help="Output categories JSON")
    infer_parser.add_argument("--sample-size", type=int, default=250, help="Sample size for inference (ignored if --all)")
    infer_parser.add_argument("--all", action="store_true", help="Process ALL writeups (batch mode)")
    infer_parser.add_argument("--batch-size", type=int, default=300, help="Batch size for full dataset mode")

    # classify command
    classify_parser = subparsers.add_parser("classify", help="Classify all writeups")
    classify_parser.add_argument("--csv", required=True, help="Input CSV file")
    classify_parser.add_argument("--categories", required=True, help="Categories JSON file")
    classify_parser.add_argument("--out", required=True, help="Output classified CSV")
    classify_parser.add_argument("--batch-size", type=int, default=20, help="Batch size for classification")

    args = parser.parse_args()

    if args.command == "infer":
        cmd_infer(args)
    elif args.command == "classify":
        cmd_classify(args)


if __name__ == "__main__":
    main()
