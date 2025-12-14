#!/usr/bin/env python3

import argparse
import base64
import csv
import http.cookiejar
import json
import os
import random
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Set, Tuple


KAGGLE_BASE_URL = "https://www.kaggle.com"

LIST_WRITEUPS_API_PATH = "/api/i/competitions.HackathonService/ListHackathonWriteUps"
GET_WRITEUP_BY_ID_API_PATH = "/api/i/discussions.WriteUpsService/GetWriteUpById"


@dataclass(frozen=True)
class Config:
    competition_slug: str
    competition_id: int
    out_dir: Path
    page_size: int
    threads: int
    request_timeout_seconds: int
    max_retries: int
    min_request_interval_seconds: float
    retry_missing_passes: int


class RateLimiter:
    def __init__(self, min_interval_seconds: float) -> None:
        self._base_min_interval_seconds = float(min_interval_seconds)
        self._current_min_interval_seconds = float(min_interval_seconds)
        self._lock = threading.Lock()
        self._next_allowed_at = 0.0

    def wait(self) -> None:
        if self._current_min_interval_seconds <= 0:
            return
        with self._lock:
            now = time.monotonic()
            if now < self._next_allowed_at:
                time.sleep(self._next_allowed_at - now)
            self._next_allowed_at = time.monotonic() + self._current_min_interval_seconds

    def penalize(self, extra_delay_seconds: float) -> None:
        """Push out the next allowed time for *all* threads.

        Useful for server-driven throttling (e.g. HTTP 429).
        """
        extra = float(extra_delay_seconds)
        if extra <= 0:
            return
        with self._lock:
            now = time.monotonic()
            self._next_allowed_at = max(self._next_allowed_at, now + extra)

    def throttle_to(self, min_interval_seconds: float) -> None:
        """Dynamically increase the minimum interval (never below the base)."""
        target = max(self._base_min_interval_seconds, float(min_interval_seconds))
        with self._lock:
            self._current_min_interval_seconds = max(self._current_min_interval_seconds, target)

    def on_success(self) -> None:
        """Gradually decay dynamic throttling back toward the base interval."""
        with self._lock:
            if self._current_min_interval_seconds <= self._base_min_interval_seconds:
                self._current_min_interval_seconds = self._base_min_interval_seconds
                return
            # Decay by 10% per successful request.
            self._current_min_interval_seconds = max(
                self._base_min_interval_seconds, self._current_min_interval_seconds * 0.9
            )


def _decode_kaggle_client_build_version(client_token: str) -> str:
    try:
        parts = client_token.split(".")
        if len(parts) < 2:
            return ""
        payload_b64 = parts[1] + "=" * (-len(parts[1]) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode("utf-8")))
        build_version = payload.get("bld")
        return str(build_version) if build_version else ""
    except Exception:
        return ""


def _atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    tmp_path.write_text(text, encoding="utf-8")
    os.replace(tmp_path, path)


def _atomic_write_json(path: Path, obj: Any) -> None:
    _atomic_write_text(path, json.dumps(obj, ensure_ascii=False, indent=2))


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _is_valid_json_file(path: Path) -> bool:
    if not path.exists():
        return False
    try:
        _read_json(path)
        return True
    except Exception:
        return False


def _bootstrap_headers(competition_slug: str, request_timeout_seconds: int) -> Dict[str, str]:
    list_url = f"{KAGGLE_BASE_URL}/competitions/{competition_slug}/writeups"

    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    req = urllib.request.Request(list_url, headers={"User-Agent": "Mozilla/5.0"})
    with opener.open(req, timeout=request_timeout_seconds) as resp:
        resp.read(2000)

    cookies: Dict[str, str] = {c.name: c.value for c in cj}

    cookie_header = "; ".join([f"{k}={v}" for k, v in cookies.items()])
    xsrf_token = urllib.parse.unquote(cookies.get("XSRF-TOKEN", ""))
    build_version = _decode_kaggle_client_build_version(cookies.get("CLIENT-TOKEN", ""))

    headers: Dict[str, str] = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) KaggleWriteupsDownloader/1.0",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if cookie_header:
        headers["Cookie"] = cookie_header
    if xsrf_token:
        headers["X-XSRF-TOKEN"] = xsrf_token
    if build_version:
        headers["X-Kaggle-Build-Version"] = build_version

    return headers


def _api_post_json(
    api_path: str,
    payload: Dict[str, Any],
    headers: Dict[str, str],
    request_timeout_seconds: int,
    max_retries: int,
    rate_limiter: RateLimiter,
) -> Any:
    url = f"{KAGGLE_BASE_URL}{api_path}"
    body = json.dumps(payload).encode("utf-8")

    last_error: Optional[BaseException] = None
    for attempt in range(1, max_retries + 1):
        rate_limiter.wait()
        try:
            req = urllib.request.Request(url, data=body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=request_timeout_seconds) as resp:
                data = json.loads(resp.read())
                rate_limiter.on_success()
                return data
        except urllib.error.HTTPError as e:
            last_error = e
            code = int(getattr(e, "code", 0) or 0)
            retryable = code in {403, 429, 500, 502, 503, 504}
            if not retryable:
                raise
            retry_after_seconds = 0.0
            try:
                if code == 429 and getattr(e, "headers", None) is not None:
                    ra = e.headers.get("Retry-After")
                    if ra:
                        retry_after_seconds = float(ra)
            except Exception:
                retry_after_seconds = 0.0

            if code == 429 and retry_after_seconds > 0:
                # If we keep getting throttled even after Retry-After, back off more aggressively.
                # This helps escape "penalty box" windows where 429 persists.
                base = retry_after_seconds
                sleep_seconds = min(600.0, base * (2 ** (attempt - 1)) + random.random())
                # Ensure all threads slow down consistently.
                rate_limiter.throttle_to(sleep_seconds)
                rate_limiter.penalize(sleep_seconds)
            else:
                sleep_seconds = min(
                    120.0,
                    max(retry_after_seconds, 0.8 * (2 ** (attempt - 1)) + random.random()),
                )
            sys.stderr.write(
                f"[retry] {api_path} attempt={attempt}/{max_retries} http={code} "
                f"sleep={sleep_seconds:.1f}s\n"
            )
            sys.stderr.flush()
            time.sleep(sleep_seconds)
        except Exception as e:
            last_error = e
            sleep_seconds = min(120.0, 0.8 * (2 ** (attempt - 1)) + random.random())
            sys.stderr.write(
                f"[retry] {api_path} attempt={attempt}/{max_retries} err={type(e).__name__} "
                f"sleep={sleep_seconds:.1f}s\n"
            )
            sys.stderr.flush()
            time.sleep(sleep_seconds)

    raise RuntimeError(f"API request failed after {max_retries} attempts: {url}") from last_error


def _list_all_writeups(
    competition_id: int,
    page_size: int,
    headers: Dict[str, str],
    request_timeout_seconds: int,
    max_retries: int,
    rate_limiter: RateLimiter,
) -> Tuple[int, List[Dict[str, Any]]]:
    page_token: Optional[str] = None
    total_count: Optional[int] = None
    items: List[Dict[str, Any]] = []

    while True:
        payload: Dict[str, Any] = {
            "competitionId": competition_id,
            "pageSize": page_size,
        }
        if page_token:
            payload["pageToken"] = page_token

        data = _api_post_json(
            LIST_WRITEUPS_API_PATH,
            payload,
            headers,
            request_timeout_seconds,
            max_retries,
            rate_limiter,
        )

        if total_count is None:
            total_count = int(data.get("totalCount") or 0)

        batch = data.get("hackathonWriteUps") or []
        if not isinstance(batch, list):
            raise RuntimeError("Unexpected response format: hackathonWriteUps is not a list")

        items.extend(batch)
        page_token = data.get("nextPageToken")
        if not page_token:
            break

    return int(total_count or 0), items


def _extract_writeup_id(list_item: Dict[str, Any]) -> Optional[int]:
    wu = list_item.get("writeUp")
    if not isinstance(wu, dict):
        return None
    wid = wu.get("id")
    if wid is None:
        return None
    try:
        return int(wid)
    except Exception:
        return None


def _fetch_writeup_detail(
    writeup_id: int,
    headers: Dict[str, str],
    request_timeout_seconds: int,
    max_retries: int,
    rate_limiter: RateLimiter,
) -> Dict[str, Any]:
    payload = {"writeUpId": int(writeup_id)}
    data = _api_post_json(
        GET_WRITEUP_BY_ID_API_PATH,
        payload,
        headers,
        request_timeout_seconds,
        max_retries,
        rate_limiter,
    )
    if not isinstance(data, dict):
        raise RuntimeError("Unexpected response format: writeup detail is not a JSON object")
    return data


def _save_writeup(detail: Dict[str, Any], writeups_dir: Path) -> None:
    wid = detail.get("id")
    if wid is None:
        raise RuntimeError("Writeup detail missing id")

    writeup_id = int(wid)
    json_path = writeups_dir / f"{writeup_id}.json"
    md_path = writeups_dir / f"{writeup_id}.md"

    _atomic_write_json(json_path, detail)

    msg = detail.get("message")
    raw_md = ""
    if isinstance(msg, dict):
        raw_md = str(msg.get("rawMarkdown") or "")
    _atomic_write_text(md_path, raw_md)


def _categorize_links(writeup_links: Any) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    application: List[Dict[str, Any]] = []
    youtube: List[Dict[str, Any]] = []
    other: List[Dict[str, Any]] = []

    if not isinstance(writeup_links, list):
        return application, youtube, other

    seen: Set[str] = set()
    for link in writeup_links:
        if not isinstance(link, dict):
            continue
        url = str(link.get("url") or "").strip()
        if not url:
            continue
        if url in seen:
            continue
        seen.add(url)

        u = url.lower()
        if "youtube.com" in u or "youtu.be" in u:
            youtube.append(link)
            continue

        media_type = str(link.get("mediaType") or "").upper()
        if media_type == "IMAGE":
            other.append(link)
            continue

        if u.startswith("https://storage.googleapis.com/"):
            other.append(link)
            continue

        application.append(link)

    return application, youtube, other


def _format_links_urls(links: Sequence[Dict[str, Any]]) -> str:
    urls: List[str] = []
    for link in links:
        url = str(link.get("url") or "").strip()
        if url:
            urls.append(url)
    return ";".join(urls)


def _build_csv(expected_ids: Sequence[int], out_dir: Path) -> Path:
    writeups_dir = out_dir / "writeups"
    csv_path = out_dir / "writeups.csv"

    fieldnames = [
        "writeup_id",
        "topic_id",
        "url",
        "title",
        "description",
        "authors",
        "content_state",
        "create_time",
        "publish_time",
        "update_time",
        "application_links",
        "youtube_links",
        "application_links_json",
        "youtube_links_json",
        "markdown_path",
        "json_path",
    ]

    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
        writer.writeheader()

        for wid in expected_ids:
            json_path = writeups_dir / f"{wid}.json"
            md_path = writeups_dir / f"{wid}.md"
            data = _read_json(json_path)

            application_links, youtube_links, _other_links = _categorize_links(data.get("writeUpLinks"))

            row = {
                "writeup_id": int(data.get("id") or wid),
                "topic_id": int(data.get("topicId") or 0) if data.get("topicId") is not None else 0,
                "url": str(data.get("url") or ""),
                "title": str(data.get("title") or ""),
                "description": str(data.get("subtitle") or ""),
                "authors": str(data.get("authors") or ""),
                "content_state": str(data.get("contentState") or ""),
                "create_time": str(data.get("createTime") or ""),
                "publish_time": str(data.get("publishTime") or ""),
                "update_time": str(data.get("updateTime") or ""),
                "application_links": _format_links_urls(application_links),
                "youtube_links": _format_links_urls(youtube_links),
                "application_links_json": json.dumps(application_links, ensure_ascii=False),
                "youtube_links_json": json.dumps(youtube_links, ensure_ascii=False),
                "markdown_path": str(md_path.relative_to(out_dir)),
                "json_path": str(json_path.relative_to(out_dir)),
            }
            writer.writerow(row)

    return csv_path


def _verify_downloaded(expected_ids: Sequence[int], out_dir: Path) -> List[int]:
    writeups_dir = out_dir / "writeups"
    missing: List[int] = []

    for wid in expected_ids:
        json_path = writeups_dir / f"{wid}.json"
        md_path = writeups_dir / f"{wid}.md"
        if not _is_valid_json_file(json_path):
            missing.append(wid)
            continue
        if not md_path.exists():
            missing.append(wid)

    return sorted(set(missing))


def _download_missing(
    missing_ids: Sequence[int],
    headers: Dict[str, str],
    cfg: Config,
    rate_limiter: RateLimiter,
) -> None:
    writeups_dir = cfg.out_dir / "writeups"
    writeups_dir.mkdir(parents=True, exist_ok=True)

    total = len(missing_ids)
    if total == 0:
        return

    counter_lock = threading.Lock()
    done = 0
    start_ts = time.monotonic()

    def mark_done() -> None:
        nonlocal done
        with counter_lock:
            done += 1
            if done == total or done % 50 == 0:
                elapsed = max(0.001, time.monotonic() - start_ts)
                rate = done / elapsed
                sys.stderr.write(f"[download] {done}/{total} ({rate:.2f}/s)\n")
                sys.stderr.flush()

    def worker(wid: int) -> Tuple[int, Optional[str]]:
        json_path = writeups_dir / f"{wid}.json"
        md_path = writeups_dir / f"{wid}.md"
        if _is_valid_json_file(json_path) and md_path.exists():
            mark_done()
            return wid, None

        detail = _fetch_writeup_detail(
            wid,
            headers,
            cfg.request_timeout_seconds,
            cfg.max_retries,
            rate_limiter,
        )
        _save_writeup(detail, writeups_dir)
        mark_done()
        return wid, None

    if cfg.threads <= 1:
        for wid in missing_ids:
            worker(wid)
        return

    import concurrent.futures

    with concurrent.futures.ThreadPoolExecutor(max_workers=cfg.threads) as ex:
        futures = [ex.submit(worker, wid) for wid in missing_ids]
        for fut in concurrent.futures.as_completed(futures):
            wid, err = fut.result()
            if err:
                raise RuntimeError(f"Failed downloading writeup {wid}: {err}")


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--competition-slug", default="gemini-3")
    parser.add_argument("--competition-id", type=int, default=120570)
    parser.add_argument("--out-dir", default="./kaggle_writeups_export")
    parser.add_argument("--page-size", type=int, default=50)
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--request-timeout-seconds", type=int, default=60)
    parser.add_argument("--max-retries", type=int, default=8)
    parser.add_argument("--min-request-interval-seconds", type=float, default=0.25)
    parser.add_argument("--retry-missing-passes", type=int, default=3)

    args = parser.parse_args(argv)

    cfg = Config(
        competition_slug=str(args.competition_slug),
        competition_id=int(args.competition_id),
        out_dir=Path(args.out_dir).expanduser().resolve(),
        page_size=int(args.page_size),
        threads=max(1, int(args.threads)),
        request_timeout_seconds=int(args.request_timeout_seconds),
        max_retries=max(1, int(args.max_retries)),
        min_request_interval_seconds=float(args.min_request_interval_seconds),
        retry_missing_passes=max(0, int(args.retry_missing_passes)),
    )

    cfg.out_dir.mkdir(parents=True, exist_ok=True)

    list_rate_limiter = RateLimiter(cfg.min_request_interval_seconds)
    detail_rate_limiter = RateLimiter(cfg.min_request_interval_seconds)
    headers = _bootstrap_headers(cfg.competition_slug, cfg.request_timeout_seconds)

    total_count, list_items = _list_all_writeups(
        cfg.competition_id,
        cfg.page_size,
        headers,
        cfg.request_timeout_seconds,
        cfg.max_retries,
        list_rate_limiter,
    )

    if total_count and len(list_items) != total_count:
        sys.stderr.write(
            f"WARNING: list count mismatch: totalCount={total_count} fetched={len(list_items)}\n"
        )
        sys.stderr.flush()
        if len(list_items) < total_count:
            return 2

    writeup_ids: List[int] = []
    for it in list_items:
        if not isinstance(it, dict):
            continue
        wid = _extract_writeup_id(it)
        if wid is None:
            continue
        writeup_ids.append(wid)

    expected_ids = sorted(set(writeup_ids))

    if total_count and len(expected_ids) != total_count:
        sys.stderr.write(
            f"WARNING: unique writeup ids mismatch: totalCount={total_count} unique={len(expected_ids)}\n"
        )
        sys.stderr.flush()
        if len(expected_ids) < total_count:
            return 2

    _atomic_write_json(cfg.out_dir / "writeups_list_raw.json", list_items)
    _atomic_write_json(
        cfg.out_dir / "writeups_index.json",
        {
            "competition_slug": cfg.competition_slug,
            "competition_id": cfg.competition_id,
            "total_count": total_count,
            "unique_writeup_count": len(expected_ids),
            "writeup_ids": expected_ids,
        },
    )

    missing = _verify_downloaded(expected_ids, cfg.out_dir)
    if missing:
        sys.stderr.write(f"need_download={len(missing)}\n")
        sys.stderr.flush()
        _download_missing(missing, headers, cfg, detail_rate_limiter)

    for _pass in range(cfg.retry_missing_passes):
        missing = _verify_downloaded(expected_ids, cfg.out_dir)
        if not missing:
            break
        sys.stderr.write(f"retry_pass: need_download={len(missing)}\n")
        sys.stderr.flush()
        _download_missing(missing, headers, cfg, detail_rate_limiter)

    missing = _verify_downloaded(expected_ids, cfg.out_dir)
    if missing:
        _atomic_write_text(cfg.out_dir / "missing_writeups.txt", "\n".join(map(str, missing)) + "\n")
        sys.stderr.write(
            f"ERROR: still missing {len(missing)} writeups after retries. See: {cfg.out_dir / 'missing_writeups.txt'}\n"
        )
        return 2

    csv_path = _build_csv(expected_ids, cfg.out_dir)

    sys.stdout.write(
        f"DONE\n"
        f"competition={cfg.competition_slug} (id={cfg.competition_id})\n"
        f"total_count={total_count} unique_writeups={len(expected_ids)}\n"
        f"out_dir={cfg.out_dir}\n"
        f"csv={csv_path}\n"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
