"""
把 media-src/videos 下的背景视频/首帧图上传到阿里云 OSS，并匿名校验直链。

改了视频之后跑这个脚本，不用进控制台拖文件。

凭据来源（按优先级）：
  1. 环境变量 OSS_KEY_FILE 指向的文本文件
  2. 默认 C:/Users/<用户名>/.workbuddy/oss-key.txt
  3. 环境变量 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET
文件格式：第一行 AccessKeyId，第二行 AccessKeySecret，不要加引号。

用法：
  python scripts/oss-upload.py            # 上传并校验
  python scripts/oss-upload.py --check    # 只做匿名直链校验，不上传
"""

import mimetypes
import os
import pathlib
import sys
import urllib.error
import urllib.request

import oss2

BUCKET = "blue-blog-source"
ENDPOINT = "https://oss-cn-beijing.aliyuncs.com"
PUBLIC_BASE = f"https://{BUCKET}.oss-cn-beijing.aliyuncs.com"

# 源文件所在目录（脚本在 scripts/ 下，仓库根是上一级）
SOURCE_DIR = pathlib.Path(__file__).resolve().parent.parent / "media-src" / "videos"

# 回访缓存 30 天。改了文件要用 ?v=N 破缓存，或者在这里调。
CACHE_CONTROL = "public, max-age=2592000"

FILES = [
    "hero.mp4",
    "hero-poster.jpg",
    "works-bg.mp4",
    "works-bg-mobile.mp4",
    "works-bg-poster.jpg",
]


def key_file_path() -> pathlib.Path:
    override = os.environ.get("OSS_KEY_FILE")
    if override:
        return pathlib.Path(override)
    return pathlib.Path.home() / ".workbuddy" / "oss-key.txt"


def read_credentials():
    path = key_file_path()
    if path.exists():
        lines = [l.strip() for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]
        if len(lines) >= 2:
            return lines[0], lines[1]
        raise SystemExit(f"{path} 需要两行：第一行 AccessKeyId，第二行 AccessKeySecret")
    ak_id = os.environ.get("OSS_ACCESS_KEY_ID", "").strip()
    ak_secret = os.environ.get("OSS_ACCESS_KEY_SECRET", "").strip()
    if ak_id and ak_secret:
        return ak_id, ak_secret
    raise SystemExit(
        f"没有凭据。请写 {path}（两行：id、secret），或设置 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET。"
    )


def probe(url):
    """匿名请求，返回 (状态码, Content-Type, Content-Length, Accept-Ranges)。"""
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    req = urllib.request.Request(url, method="GET")
    try:
        with opener.open(req, timeout=30) as r:
            return (
                r.status,
                r.headers.get("Content-Type", "-"),
                int(r.headers.get("Content-Length") or 0),
                r.headers.get("Accept-Ranges", "-"),
            )
    except urllib.error.HTTPError as e:
        return e.code, "-", 0, "-"


def main():
    check_only = "--check" in sys.argv

    if not check_only:
        ak_id, ak_secret = read_credentials()
        bucket = oss2.Bucket(oss2.Auth(ak_id, ak_secret), ENDPOINT, BUCKET)

        try:
            bucket.get_bucket_info()
            print(f"[ok] 凭据有效，桶 {BUCKET} 可访问")
        except oss2.exceptions.OssError as e:
            raise SystemExit(f"[fail] 凭据或权限有问题：{e.code} {e.message}")

        for name in FILES:
            local = SOURCE_DIR / name
            if not local.exists():
                raise SystemExit(f"[fail] 本地文件缺失：{local}")
            key = f"videos/{name}"
            ctype = mimetypes.guess_type(name)[0] or "application/octet-stream"
            bucket.put_object_from_file(
                key,
                str(local),
                headers={"Content-Type": ctype, "Cache-Control": CACHE_CONTROL},
            )
            print(f"[up] {key:32} {local.stat().st_size:>9,} B  {ctype}")

    print("\n匿名直链校验：")
    bad = 0
    for name in FILES:
        code, ctype, length, ranges = probe(f"{PUBLIC_BASE}/videos/{name}")
        ok = code == 200 and ctype in ("video/mp4", "image/jpeg") and ranges == "bytes"
        bad += 0 if ok else 1
        mark = "✓" if ok else "✗"
        print(f"  {mark} {code}  {ctype:12} {length:>9,} B  ranges={ranges:5}  {name}")

    print("\n全部通过" if bad == 0 else f"\n{bad} 个不合格")
    return 0 if bad == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
