#!/usr/bin/env python3
"""
使用 Claude API 从 Kaggle Writeups 提取中文关键词
"""

import pandas as pd
import requests
import json
import time
from tqdm import tqdm

import os

# API 配置 (从环境变量读取)
API_BASE = os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")
API_KEY = os.environ.get("OPENAI_API_KEY", "")
MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o")

# 文件配置
INPUT_CSV = "kaggle_writeups_export/writeups_classified.csv"
OUTPUT_CSV = "kaggle_writeups_export/writeups_classified.csv"

# 批处理配置
BATCH_SIZE = 10  # 每次处理的记录数
SLEEP_TIME = 0.5  # 请求间隔（秒）

def extract_keywords_batch(items):
    """
    批量提取关键词
    items: list of dict with 'title' and 'description'
    """
    # 构建批量提取的 prompt
    prompt_items = []
    for i, item in enumerate(items):
        title = item.get('title', '')
        desc = item.get('description', '')
        prompt_items.append(f"{i+1}. 标题: {title}\n   描述: {desc}")

    items_text = "\n\n".join(prompt_items)

    prompt = f"""请为以下每个项目提取8-10个中文关键词，关键词应该反映项目的核心功能、技术领域、应用场景和目标用户。

{items_text}

请按以下JSON格式返回，只返回JSON，不要其他内容：
{{
  "1": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5", "关键词6", "关键词7", "关键词8"],
  "2": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5", "关键词6", "关键词7", "关键词8"],
  ...
}}"""

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL,
        "max_tokens": 2000,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(
            f"{API_BASE}/chat/completions",
            headers=headers,
            json=data,
            timeout=60
        )
        response.raise_for_status()

        result = response.json()
        content = result['choices'][0]['message']['content']

        # 提取 JSON 部分
        # 尝试找到 JSON 开始和结束位置
        start = content.find('{')
        end = content.rfind('}') + 1
        if start != -1 and end > start:
            json_str = content[start:end]
            keywords_dict = json.loads(json_str)
            return keywords_dict
        else:
            print(f"无法解析响应: {content[:200]}")
            return {}

    except Exception as e:
        print(f"API 请求失败: {e}")
        return {}

def main():
    print("=" * 60)
    print("Kaggle Writeups 中文关键词提取工具")
    print(f"使用模型: {MODEL}")
    print("=" * 60)

    # 读取 CSV
    print(f"\n正在读取: {INPUT_CSV}")
    df = pd.read_csv(INPUT_CSV)
    print(f"总共 {len(df)} 条记录")

    # 检查是否已有关键词列
    if 'keywords_cn' not in df.columns:
        df['keywords_cn'] = None

    # 找出未处理的记录
    unprocessed_mask = df['keywords_cn'].isna() | (df['keywords_cn'] == '')
    unprocessed_idx = df[unprocessed_mask].index.tolist()

    processed_count = len(df) - len(unprocessed_idx)
    print(f"已处理: {processed_count} 条")
    print(f"待处理: {len(unprocessed_idx)} 条")

    if len(unprocessed_idx) == 0:
        print("\n所有记录已处理完成!")
        return

    # 分批处理
    total_batches = (len(unprocessed_idx) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"\n开始处理 (每批 {BATCH_SIZE} 条, 共 {total_batches} 批)...")

    for batch_start in tqdm(range(0, len(unprocessed_idx), BATCH_SIZE), desc="提取进度", total=total_batches):
        batch_idx = unprocessed_idx[batch_start:batch_start + BATCH_SIZE]

        # 准备批量数据
        batch_items = []
        for idx in batch_idx:
            batch_items.append({
                'title': df.at[idx, 'title'],
                'description': df.at[idx, 'description']
            })

        # 调用 API 提取关键词
        keywords_dict = extract_keywords_batch(batch_items)

        # 更新 DataFrame
        for i, idx in enumerate(batch_idx):
            key = str(i + 1)
            if key in keywords_dict:
                keywords = keywords_dict[key]
                if isinstance(keywords, list):
                    df.at[idx, 'keywords_cn'] = ','.join(keywords)
                else:
                    df.at[idx, 'keywords_cn'] = str(keywords)

        # 每批保存一次
        df.to_csv(OUTPUT_CSV, index=False)

        # 等待一下
        if batch_start + BATCH_SIZE < len(unprocessed_idx):
            time.sleep(SLEEP_TIME)

    print(f"\n处理完成! 已保存到: {OUTPUT_CSV}")

    # 显示一些示例
    print("\n提取示例:")
    print("-" * 60)
    sample = df[df['keywords_cn'].notna()][['title', 'keywords_cn']].head(5)
    for _, row in sample.iterrows():
        print(f"标题: {row['title'][:50]}...")
        print(f"关键词: {row['keywords_cn']}")
        print()

if __name__ == "__main__":
    main()
