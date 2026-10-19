"""
把 media-src/ 下的所有素材上传到阿里云 OSS，并匿名校验直链。

**目录结构即对象键**：`media-src/works/design/a.mp4` → `works/design/a.mp4`。
所以新增素材只要按目标路径丢进 media-src/，再跑一遍这个脚本，不用改代码。
（`media-src/` 本身不进构建、不发布到 Pages，只作源文件备份。）

凭据来源（按优先级）：
  1. 环境变量 OSS_KEY_FILE 指向的文本文件
  2. 默认 C:/Users/<用户名>/.workbuddy/oss-key.txt
  3. 环境变量 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET
文件格式：第一行 AccessKeyId，第二行 AccessKeySecret，不要加引号。

用法：
  python scripts/oss-upload.py                     # 上传全部并校验
  python scripts/oss-upload.py --only works/design # 只处理某个目录/文件
  python scripts/oss-upload.py --check             # 只做匿名直链校验，不上传
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
SOURCE_DIR = pathlib.Path(__file__).resolve().parent.parent / "media-src"

# 回访缓存 30 天。改了文件要用 ?v=N 破缓存，或者在这里调。
CACHE_CONTROL = "public, max-age=2592000"

# 显式指定类型：OSS 只按扩展名猜，jpg 会被猜成 application/octet-stream，
# 那浏览器就不当图片加载了。
CONTENT_TYPES = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}


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


def collect(only: str | None):
    """返回 [(key, 本地路径)]，跳过隐藏文件（比如两遍编码留下的 .p-0.log）。"""
    if not SOURCE_DIR.is_dir():
        raise SystemExit(f"[fail] 源目录不存在：{SOURCE_DIR}")

    files = []
    for path in sorted(SOURCE_DIR.rglob("*")):
        if not path.is_file() or path.name.startswith("."):
            continue
        key = path.relative_to(SOURCE_DIR).as_posix()
        if only and not (key == only or key.startswith(only.rstrip("/") + "/")):
            continue
        files.append((key, path))

    if not files:
        raise SystemExit(f"[fail] {SOURCE_DIR} 下没有可上传的文件" + (f"（筛选：{only}）" if only else ""))
    return files


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
    argv = sys.argv[1:]
    check_only = "--check" in argv
    only = None
    if "--only" in argv:
        index = argv.index("--only")
        if index + 1 >= len(argv):
            raise SystemExit("--only 后面要跟对象键前缀，如 works/design")
        only = argv[index + 1].strip("/")

    files = collect(only)

    if not check_only:
        ak_id, ak_secret = read_credentials()
        bucket = oss2.Bucket(oss2.Auth(ak_id, ak_secret), ENDPOINT, BUCKET)

        try:
            bucket.get_bucket_info()
            print(f"[ok] 凭据有效，桶 {BUCKET} 可访问")
        except oss2.exceptions.OssError as e:
            raise SystemExit(f"[fail] 凭据或权限有问题：{e.code} {e.message}")

        for key, local in files:
            ext = local.suffix.lower()
            ctype = CONTENT_TYPES.get(ext) or mimetypes.guess_type(local.name)[0] or "application/octet-stream"
            bucket.put_object_from_file(
                key,
                str(local),
                headers={"Content-Type": ctype, "Cache-Control": CACHE_CONTROL},
            )
            print(f"[up] {key:40} {local.stat().st_size:>9,} B  {ctype}")

    print("\n匿名直链校验：")
    bad = 0
    for key, _ in files:
        code, ctype, length, ranges = probe(f"{PUBLIC_BASE}/{key}")
        expect = CONTENT_TYPES.get(pathlib.Path(key).suffix.lower())
        ok = code == 200 and (expect is None or ctype == expect) and ranges == "bytes"
        bad += 0 if ok else 1
        mark = "✓" if ok else "✗"
        print(f"  {mark} {code}  {ctype:12} {length:>9,} B  ranges={ranges:5}  {key}")

    print("\n全部通过" if bad == 0 else f"\n{bad} 个不合格")
    return 0 if bad == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
